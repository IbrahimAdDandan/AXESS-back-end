/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License") +  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.openmeetings.webservice;

import com.github.openjson.JSONObject;
import org.apache.cxf.feature.Features;
import org.apache.openmeetings.core.util.StrongPasswordValidator;
import org.apache.openmeetings.db.dao.server.SOAPLoginDao;
import org.apache.openmeetings.db.dao.user.GroupDao;
import org.apache.openmeetings.db.dao.user.IUserManager;
import org.apache.openmeetings.db.dto.basic.ServiceResult;
import org.apache.openmeetings.db.dto.basic.ServiceResult.Type;
import org.apache.openmeetings.db.dto.room.InvitationDTO;
import org.apache.openmeetings.db.dto.room.RoomOptionsDTO;
import org.apache.openmeetings.db.dto.user.ExternalUserDTO;
import org.apache.openmeetings.db.dto.user.GroupDTO;
import org.apache.openmeetings.db.dto.user.UserDTO;
import org.apache.openmeetings.db.entity.room.Invitation;
import org.apache.openmeetings.db.entity.server.RemoteSessionObject;
import org.apache.openmeetings.db.entity.server.Sessiondata;
import org.apache.openmeetings.db.entity.user.Address;
import org.apache.openmeetings.db.entity.user.User;
import org.apache.openmeetings.db.entity.user.User.Right;
import org.apache.openmeetings.util.OmException;
import org.apache.openmeetings.webservice.error.ServiceException;
import org.apache.wicket.util.string.Strings;
import org.apache.wicket.validation.IValidationError;
import org.apache.wicket.validation.IValidator;
import org.apache.wicket.validation.Validatable;
import org.apache.wicket.validation.ValidationError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebService;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.apache.openmeetings.db.dto.basic.ServiceResult.UNKNOWN;
import static org.apache.openmeetings.util.OpenmeetingsVariables.*;
import static org.apache.openmeetings.webservice.Constants.*;

/**
 * The Service contains methods to login and create hash to directly enter
 * conference rooms, recordings or the application in general
 *
 * @author sebawagner
 */
@Service("userWebService")
@WebService(serviceName = USER_SERVICE_NAME, targetNamespace = TNS, portName = USER_SERVICE_PORT_NAME)
@Features(features = "org.apache.cxf.ext.logging.LoggingFeature")
@Produces({MediaType.APPLICATION_JSON})
@Path("/user")
public class UserWebService extends BaseWebService {
    private static final Logger log = LoggerFactory.getLogger(UserWebService.class);

    @Autowired
    private IUserManager userManager;
    @Autowired
    private SOAPLoginDao soapDao;
    @Autowired
    private GroupDao groupDao;

    /**
     * @param user - login or email of Openmeetings user with admin or SOAP-rights
     * @param pass - password
     * @return - {@link ServiceResult} with error code or SID and userId
     */
    @WebMethod
    @GET
    @Path("/login")
    public ServiceResult login(@WebParam(name = "user") @QueryParam("user") String user, @WebParam(name = "pass") @QueryParam("pass") String pass) {
        try {
            log.debug("Login user");
            User u = userDao.login(user, pass);
            if (u == null) {
                return new ServiceResult("error.bad.credentials", Type.ERROR);
            }

            Sessiondata sd = sessionDao.create(u.getId(), u.getLanguageId());
            log.debug("Login user: {}", u.getId());
            JSONObject j = new JSONObject("{\"sid\":\"" + sd.getSessionId() +
                    "\", \"user_id\":" + sd.getUserId() + "}");
            return new ServiceResult(j.toString(), Type.SUCCESS);
        } catch (OmException oe) {
            return oe.getKey() == null ? UNKNOWN : new ServiceResult(oe.getKey(), Type.ERROR);
        } catch (Exception err) {
            log.error("[login]", err);
            return UNKNOWN;
        }
    }

    /**
     * Lists all users in the system!
     *
     * @param sid The SID from getSession
     * @return - list of users
     */
    @WebMethod
    @GET
    @Path("/")
    public List<UserDTO> get(@WebParam(name = "sid") @QueryParam("sid") String sid) {
        return performCall(sid, User.Right.SOAP, sd -> UserDTO.list(userDao.getAllUsers()));
    }

    /**
     * Adds a new User like through the Frontend, but also does activates the
     * Account To do SSO see the methods to create a hash and use those ones!
     *
     * @param sid     The SID from getSession
     * @param user    user object
     * @param confirm whatever or not to send email, leave empty for auto-send
     * @return - id of the user added or error code
     */
    @WebMethod
    @POST
    @Path("/")
    public UserDTO add(
            @WebParam(name = "sid") @QueryParam("sid") String sid
            , @WebParam(name = "user") @FormParam("user") UserDTO user
            , @WebParam(name = "confirm") @FormParam("confirm") Boolean confirm
    ) {
        return performCall(sid, User.Right.SOAP, sd -> {
            if (!isAllowRegisterSoap()) {
                throw new ServiceException("Soap register is denied in Settings");
            }
            User testUser = userDao.getExternalUser(user.getExternalId(), user.getExternalType());

            if (testUser != null) {
                throw new ServiceException("User does already exist!");
            }

            String tz = user.getTimeZoneId();
            if (Strings.isEmpty(tz)) {
                tz = getDefaultTimezone();
            }
            if (user.getAddress() == null) {
                user.setAddress(new Address());
                user.getAddress().setCountry(Locale.getDefault().getCountry());
            }
            if (user.getLanguageId() == null) {
                user.setLanguageId(1L);
            }
            User jsonUser = user.get(userDao, groupDao);
            IValidator<String> passValidator = new StrongPasswordValidator(true, jsonUser);
            Validatable<String> passVal = new Validatable<>(user.getPassword());
            passValidator.validate(passVal);
            if (!passVal.isValid()) {
                StringBuilder sb = new StringBuilder();
                for (IValidationError err : passVal.getErrors()) {
                    sb.append(((ValidationError) err).getMessage()).append(System.lineSeparator());
                }
                log.debug("addNewUser::weak password '{}', msg: {}", user.getPassword(), sb);
                throw new ServiceException(sb.toString());
            }
            Object ouser;
            try {
                jsonUser.addGroup(groupDao.get(getDefaultGroup()));
                ouser = userManager.registerUser(jsonUser, user.getPassword(), null);
            } catch (NoSuchAlgorithmException | OmException e) {
                throw new ServiceException("Unexpected error while creating user");
            }

            if (ouser == null) {
                throw new ServiceException(UNKNOWN.getMessage());
            } else if (ouser instanceof String) {
                throw new ServiceException((String) ouser);
            }

            User u = (User) ouser;

            u.getRights().add(Right.ROOM);
            if (Strings.isEmpty(user.getExternalId()) && Strings.isEmpty(user.getExternalType())) {
                // activate the User
                u.getRights().add(Right.LOGIN);
                u.getRights().add(Right.DASHBOARD);
            }

            u = userDao.update(u, sd.getUserId());

            return new UserDTO(u);
        });
    }


    /**
     * Adds a new User like through the Frontend, but also does activates the
     * Account To do SSO see the methods to create a hash and use those ones!
     *
     * @param user    user object
     * @param confirm whatever or not to send email, leave empty for auto-send
     * @return - id of the user added or error code
     * @created by Ibrahim AdDandan
     */
    @WebMethod
    @POST
    @Path("/register")
    public UserDTO register(
            @WebParam(name = "user") @FormParam("user") UserDTO user
            , @WebParam(name = "confirm") @FormParam("confirm") Boolean confirm
    ) {
        log.debug("Register end-point to add new user without sid......");
//		UserDao userDao = getUserDao();
        if (!isAllowRegisterSoap()) {
            throw new ServiceException("Soap register is denied in Settings");
        }
        User testUser = userDao.getExternalUser(user.getExternalId(), user.getExternalType());

        if (testUser != null) {
            throw new ServiceException("User does already exist!");
        }

        String tz = user.getTimeZoneId();
        if (Strings.isEmpty(tz)) {
            tz = getDefaultTimezone();
        }
        if (user.getAddress() == null) {
            user.setAddress(new Address());
            user.getAddress().setCountry(Locale.getDefault().getCountry());
        }
        if (user.getLanguageId() == null) {
            user.setLanguageId(1L);
        }
        User jsonUser = user.get(userDao, groupDao);
//        IValidator<String> passValidator = new StrongPasswordValidator(true, jsonUser);
//        Validatable<String> passVal = new Validatable<>(user.getPassword());
//        passValidator.validate(passVal);
//        if (!passVal.isValid()) {
//            StringBuilder sb = new StringBuilder();
//            for (IValidationError err : passVal.getErrors()) {
//                sb.append(((ValidationError) err).getMessage()).append(System.lineSeparator());
//            }
//            log.debug("addNewUser::weak password '{}', msg: {}", user.getPassword(), sb);
//            throw new ServiceException(sb.toString());
//        }
        Object ouser;
        try {
            jsonUser.addGroup(groupDao.get(getDefaultGroup()));
            jsonUser.setType(User.Type.USER);
            ouser = userManager.registerUser(jsonUser, user.getPassword(), null);
        } catch (NoSuchAlgorithmException | OmException e) {
            throw new ServiceException("Unexpected error while creating user");
        }

        if (ouser == null) {
            throw new ServiceException(UNKNOWN.getMessage());
        } else if (ouser instanceof String) {
            throw new ServiceException((String) ouser);
        }

        User u = (User) ouser;

        u.getRights().add(Right.ROOM);
//        if (Strings.isEmpty(user.getExternalId()) && Strings.isEmpty(user.getExternalType())) {
        // activate the User
        u.getRights().add(Right.LOGIN);
        u.getRights().add(Right.SOAP);
//            u.getRights().add(Right.DASHBOARD);
//        }

        u = userDao.update(u, null);

        return new UserDTO(u);
    }


    /**
     * Update password
     *
     * @param sid  sid
     * @param id   user id
     * @param pass new password
     * @return - success message or error
     * @created by Ibrahim AdDandan
     */
    @WebMethod
    @POST
    @Path("/changepass")
    public ServiceResult changePassword(
            @WebParam(name = "sid") @QueryParam("sid") String sid
            , @WebParam(name = "id") @QueryParam("id") long id
            , @WebParam(name = "pass") @QueryParam("pass") String pass
    ) {
        return performCall(sid, Right.LOGIN, sd -> {
            try {
                long thisId = sd.getUserId();
                if (thisId == id) {
                    userDao.update(userDao.get(id), pass, id);
                    return new ServiceResult("Password changed", Type.SUCCESS);
                }
                return new ServiceResult("You can't update other users passwords!", Type.ERROR);
            } catch (NoSuchAlgorithmException e) {
                return new ServiceResult("Error occured", Type.ERROR);
            }

        });

    }

    /**
     * update user info by id
     *
     * @param id user id
     *           Edited by Ibrahim AdDandan
     */
    @WebMethod
    @POST
    @Path("/{id}")
    public UserDTO updateUserInfo(@WebParam(name = "sid") @QueryParam("sid") String sid,
                                  @WebParam(name = "id") @PathParam("id") long id,
                                  @WebParam(name = "user") @FormParam("user") UserDTO user) {
        return performCall(sid, Right.LOGIN, sd -> {
            try {
                long thisId = sd.getUserId();
                log.debug("update user info with id: ", thisId);
                if (thisId == id) {
                    log.debug("the id conform the session id...");
//					UserDao userDao = getUserDao();
                    User u = user.get(userDao);
                    log.debug("user info will be updated...");
                    return new UserDTO(userDao.update(u, id));
                }
                log.debug("something went wrong while updating user info...");
                return null;
            } catch (Exception e) {
                log.debug(e.getMessage());
                UserDTO ex = (new UserDTO());
                ex.setExternalId(e.getMessage());
                return ex;
            }

        });
    }


    /**
     * get user by id
     *
     * @param id user id
     *           <p>
     *           Edited by Ibrahim Ad_Dandan
     */
    @WebMethod
    @GET
    @Path("/{id}")
    public UserDTO getUserById(@WebParam(name = "sid") @QueryParam("sid") String sid,
                               @WebParam(name = "id") @PathParam("id") long id) {
        return performCall(sid, Right.LOGIN, sd -> {
            try {
                long thisId = sd.getUserId();
                if (thisId == id) {
                    return new UserDTO(userDao.getUserById(id));
                }
                return null;
            } catch (Exception e) {
                UserDTO ex = (new UserDTO());
                ex.setExternalId(e.getMessage());
                return ex;
            }

        });
    }

    /**
     *
     */
    @WebMethod
    @GET
    @Path("/groups/{id}")
    public List<GroupDTO> getGroupUser(@WebParam(name = "sid") @QueryParam("sid") String sid,
                                       @WebParam(name = "id") @PathParam("id") long id) {
        return performCall(sid, Right.LOGIN, sd -> {
            try {
                User u = userDao.getUserById(id);
                return GroupDTO.listGroupUser(u.getGroupUsers());
            } catch (Exception e) {
                return null;
            }
        });
    }


    /**
     * get invitations for user by id
     *
     * @param id user id
     *           <p>
     *           Edited by Ibrahim Ad_Dandan
     */
    @WebMethod
    @GET
    @Path("/invitations/{id}")
    public List<InvitationDTO> getInvitationsUserById(
            @QueryParam("sid") @WebParam(name = "sid") String sid,
            @WebParam(name = "id") @PathParam("id") long id
    ) {
        return performCall(sid, Right.SOAP, sd -> {
            log.debug("get invitations by user id requested...");
            log.debug("the id is: ", id);
//			InvitationDao invitationDao = getInvitationDao();
            List<Invitation> invitations = invitationDao.getByUser(id);
            log.debug(invitations.get(0).toString());
            return InvitationDTO.list(invitations);
        });
    }

    /**
     * Delete a certain user by its id
     *
     * @param sid The SID from getSession
     * @param id  the openmeetings user id
     * @return - id of the user deleted, error code otherwise
     */
    @WebMethod
    @DELETE
    @Path("/{id}")
    public ServiceResult delete(@WebParam(name = "sid") @QueryParam("sid") String sid, @WebParam(name = "id") @PathParam("id") long id) {
        return performCall(sid, User.Right.ADMIN, sd -> {
            userDao.delete(userDao.get(id), sd.getUserId());

            return new ServiceResult("Deleted", Type.SUCCESS);
        });
    }

    /**
     * Delete a certain user by its external user id
     *
     * @param sid          The SID from getSession
     * @param externalId   externalUserId
     * @param externalType externalUserId
     * @return - id of user deleted, or error code
     */
    @DELETE
    @Path("/{externaltype}/{externalid}")
    public ServiceResult deleteExternal(
            @WebParam(name = "sid") @QueryParam("sid") String sid
            , @WebParam(name = "externaltype") @PathParam("externaltype") String externalType
            , @WebParam(name = "externalid") @PathParam("externalid") String externalId
    ) {
        return performCall(sid, User.Right.ADMIN, sd -> {
            User user = userDao.getExternalUser(externalId, externalType);

            // Setting user deleted
            userDao.delete(user, sd.getUserId());

            return new ServiceResult("Deleted", Type.SUCCESS);
        });
    }

    /**
     * Description: sets the SessionObject for a certain SID, after setting this
     * Session-Object you can use the SID + a RoomId to enter any Room. ...
     * Session-Hashs are deleted 15 minutes after the creation if not used.
     *
     * @param sid     The SID from getSession
     * @param user    user details to set
     * @param options room options to set
     * @return - secure hash or error code
     */
    @WebMethod
    @POST
    @Path("/hash")
    public ServiceResult getRoomHash(
            @WebParam(name = "sid") @QueryParam("sid") String sid
            , @WebParam(name = "user") @FormParam("user") ExternalUserDTO user
            , @WebParam(name = "options") @FormParam("options") RoomOptionsDTO options
    ) {
        return performCall(sid, User.Right.SOAP, sd -> {
            if (Strings.isEmpty(user.getExternalId()) || Strings.isEmpty(user.getExternalType())) {
                return new ServiceResult("externalId and/or externalType are not set", Type.ERROR);
            }
            RemoteSessionObject remoteSessionObject = new RemoteSessionObject(user);

            log.debug(remoteSessionObject.toString());

            String xmlString = remoteSessionObject.toString();

            log.debug("jsonString {}", xmlString);

            String hash = soapDao.addSOAPLogin(sid, options);

            if (hash != null) {
                if (options.isAllowSameURLMultipleTimes()) {
                    sd.setPermanent(true);
                }
                sd.setXml(xmlString);
                sd = sessionDao.update(sd);
                return new ServiceResult(hash, Type.SUCCESS);
            }
            return UNKNOWN;
        });
    }


    /**
     * Send mail from contact us form
     *
     * @param email
     * @param subject
     * @param content
     * @return
     */
    @WebMethod
    @POST
    @Path("/mail")
    public ServiceResult sendMail(@WebParam(name = "email") @FormParam("email") String email,
                                  @WebParam(name = "subject") @FormParam("subject") String subject,
                                  @WebParam(name = "content") @FormParam("content") String content) {
        mailHandler.send(email, subject, content);
        return new ServiceResult("Mail Sent", ServiceResult.Type.SUCCESS);
    }


    @WebMethod
    @GET
    @Path("/forgot")
    public ServiceResult forgotMyPass(@WebParam(name = "email") @FormParam("email") String email) {
        String uuid = UUID.randomUUID().toString();
        uuid.replace("-", "");
        try {
            User user = userDao.getByEmail(email);
            if(user != null) {
                userDao.update(userDao.get(user.getId()), uuid, user.getId());
                mailHandler.send(email, "Your new Password For EDU Room AXESS", "Your new Password For EDU Room AXESS is: " + uuid);
                return new ServiceResult("Password updated successfully", Type.SUCCESS);
            }
            return new ServiceResult("invalid mail", Type.SUCCESS);
        } catch(Exception e) {
            return new ServiceResult(e.getMessage(), Type.ERROR);
        }
    }


}
