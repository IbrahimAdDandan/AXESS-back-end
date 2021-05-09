/*! NoSleep.js v0.11.0 - git.io/vfn01 - Rich Tibbett - MIT license */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NoSleep"] = factory();
	else
		root["NoSleep"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = __webpack_require__(1),
    webm = _require.webm,
    mp4 = _require.mp4;

// Detect iOS browsers < version 10


var oldIOS = typeof navigator !== "undefined" && parseFloat(("" + (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ""])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) < 10 && !window.MSStream;

// Detect native Wake Lock API support
var nativeWakeLock = "wakeLock" in navigator;

var NoSleep = function () {
  function NoSleep() {
    var _this = this;

    _classCallCheck(this, NoSleep);

    if (nativeWakeLock) {
      this._wakeLock = null;
      var handleVisibilityChange = function handleVisibilityChange() {
        if (_this._wakeLock !== null && document.visibilityState === "visible") {
          _this.enable();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleVisibilityChange);
    } else if (oldIOS) {
      this.noSleepTimer = null;
    } else {
      // Set up no sleep video element
      this.noSleepVideo = document.createElement("video");

      this.noSleepVideo.setAttribute("title", "No Sleep");
      this.noSleepVideo.setAttribute("playsinline", "");

      this._addSourceToVideo(this.noSleepVideo, "webm", webm);
      this._addSourceToVideo(this.noSleepVideo, "mp4", mp4);

      this.noSleepVideo.addEventListener("loadedmetadata", function () {
        if (_this.noSleepVideo.duration <= 1) {
          // webm source
          _this.noSleepVideo.setAttribute("loop", "");
        } else {
          // mp4 source
          _this.noSleepVideo.addEventListener("timeupdate", function () {
            if (_this.noSleepVideo.currentTime > 0.5) {
              _this.noSleepVideo.currentTime = Math.random();
            }
          });
        }
      });
    }
  }

  _createClass(NoSleep, [{
    key: "_addSourceToVideo",
    value: function _addSourceToVideo(element, type, dataURI) {
      var source = document.createElement("source");
      source.src = dataURI;
      source.type = "video/" + type;
      element.appendChild(source);
    }
  }, {
    key: "enable",
    value: function enable() {
      var _this2 = this;

      if (nativeWakeLock) {
        navigator.wakeLock.request("screen").then(function (wakeLock) {
          _this2._wakeLock = wakeLock;
          console.log("Wake Lock active.");
          _this2._wakeLock.addEventListener("release", function () {
            // ToDo: Potentially emit an event for the page to observe since
            // Wake Lock releases happen when page visibility changes.
            // (https://web.dev/wakelock/#wake-lock-lifecycle)
            console.log("Wake Lock released.");
          });
        }).catch(function (err) {
          console.error(err.name + ", " + err.message);
        });
      } else if (oldIOS) {
        this.disable();
        console.warn("\n        NoSleep enabled for older iOS devices. This can interrupt\n        active or long-running network requests from completing successfully.\n        See https://github.com/richtr/NoSleep.js/issues/15 for more details.\n      ");
        this.noSleepTimer = window.setInterval(function () {
          if (!document.hidden) {
            window.location.href = window.location.href.split("#")[0];
            window.setTimeout(window.stop, 0);
          }
        }, 15000);
      } else {
        this.noSleepVideo.play();
      }
    }
  }, {
    key: "disable",
    value: function disable() {
      if (nativeWakeLock) {
        this._wakeLock.release();
        this._wakeLock = null;
      } else if (oldIOS) {
        if (this.noSleepTimer) {
          console.warn("\n          NoSleep now disabled for older iOS devices.\n        ");
          window.clearInterval(this.noSleepTimer);
          this.noSleepTimer = null;
        }
      } else {
        this.noSleepVideo.pause();
      }
    }
  }]);

  return NoSleep;
}();

module.exports = NoSleep;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  webm: "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",
  mp4: "data:video/mp4;base64,AAAAIGZ0eXBtcDQyAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC8wYF///v3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjQ3OSBkZDc5YTYxIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTEgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9MiBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0wIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MCA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0wIHRocmVhZHM9NiBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTMgYl9weXJhbWlkPTIgYl9hZGFwdD0xIGJfYmlhcz0wIGRpcmVjdD0xIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MSBrZXlpbnQ9MzAwIGtleWludF9taW49MzAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IHZidl9tYXhyYXRlPTIwMDAwIHZidl9idWZzaXplPTI1MDAwIGNyZl9tYXg9MC4wIG5hbF9ocmQ9bm9uZSBmaWxsZXI9MCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAOWWIhAA3//p+C7v8tDDSTjf97w55i3SbRPO4ZY+hkjD5hbkAkL3zpJ6h/LR1CAABzgB1kqqzUorlhQAAAAxBmiQYhn/+qZYADLgAAAAJQZ5CQhX/AAj5IQAD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"
};

/***/ })
/******/ ]);
});/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var Activities = function() {
	const closedHeight = 20, timeout = 10000;
	let activities, aclean, modArea, area, openedHeight = 345
		, openedHeightPx = openedHeight + 'px', inited = false
		, newActNotification;

	function _load() {
		const s = Settings.load();
		if (typeof(s.activity) === 'undefined') {
			s.activity = {};
		}
		return s;
	}
	function _updateClean(s, a) {
		const clean = s.activity.clean === true;
		a.prop('checked', clean);
		if (clean) {
			activities.find('.auto-clean').each(function() {
				setTimeout(_clearItem.bind(null, $(this).data().id), timeout);
			});
		}
	}
	function isClosed() {
		return activities.height() < 24;
	}
	function _updateHeightVar(h) {
		Room.setCssVar('--activities-height', h);
	}
	function _open() {
		if (isClosed()) {
			$('.control.block i', activities).removeClass('fa-angle-up').addClass('fa-angle-down');
			$('.control.block', activities).removeClass('bg-warning');
			activities.animate(
				{
					height: openedHeightPx
					, top: '-' + openedHeightPx
				}
				, 1000
				, function() {
					activities.css({'top': ''});
					_updateHeightVar(openedHeightPx);
					activities.resizable('option', 'disabled', false);
				}
			);
		}
	}
	function _close() {
		if (!isClosed()) {
			$('.control.block i', activities).removeClass('fa-angle-down').addClass('fa-angle-up');
			activities.animate(
				{
					height: closedHeight
					, top: (openedHeight - closedHeight) + 'px'
				}
				, 1000
				, function() {
					activities.css({'top': ''});
					_updateHeightVar(closedHeight + 'px');
				}
			);
			activities.resizable('option', 'disabled', true);
		}
	}
	function _findUser(uid) {
		const m = '5px', t = 50, u = $('#user' + uid);
		if (u.length === 1) {
			u[0].scrollIntoView();
			u.addClass('bg-warning');
			for(let i = 0; i < 10; i++) {
				u.animate({marginTop: '-='+m}, t)
					.animate({marginTop: '+='+m}, t);
			}
			u.removeClass('bg-warning', 1500);
		}
	}
	function _hightlight(notify) {
		if (!inited) {
			return;
		}
		if (isClosed()) {
			$('.control.block', activities).addClass('bg-warning');
			if (window === window.parent && notify) {
				function _newMessage() {
					new Notification(newActNotification, {
						tag: 'new_aa_item'
					});
				}
				if (Notification.permission === 'granted') {
					_newMessage();
				} else if (Notification.permission !== 'denied') {
					Notification.requestPermission().then(permission => {
						if (permission === 'granted') {
							_newMessage();
						}
					});
				}
			}
		}
	}
	function _getId(id) {
		return 'activity-' + id;
	}
	function _action(name, val) {
		activityAction($('.room-block .room-container').data('room-id'), name, val);
	}
	function _remove(ids) {
		for (let i = 0; i < ids.length; ++i) {
			$('#' + _getId(ids[i])).remove();
		}
		_updateCount();
	}
	function _clearItem(id) {
		if (aclean.prop('checked')) {
			_remove([id]);
		}
	}
	function _updateCount() {
		if (!inited) {
			return;
		}
		$('.control.block .badge', activities).text(modArea.find('.activity').length);
	}

	return {
		init: function() {
			if ($('#activities').resizable("instance") !== undefined) {
				return;
			}
			activities = $('#activities');
			const ctrlBlk = activities.find('.control.block');
			ctrlBlk.off().click(Activities.toggle);
			newActNotification = ctrlBlk.data('new-aa');
			activities.resizable({
				handles: 'n'
				, disabled: isClosed()
				, minHeight: 195
				, stop: function(_, ui) {
					openedHeight = ui.size.height;
					openedHeightPx = openedHeight + 'px';
					_updateHeightVar(openedHeightPx);
					activities.css({'top': ''});
				}
			});
			modArea = activities.find('.area .actions');
			area = activities.find('.area .activities');
			aclean = $('#activity-auto-clean');
			aclean.change(function() {
				const s = _load();
				s.activity.clean = $(this).prop('checked');
				Settings.save(s);
				_updateClean(s, $(this));
			});
			_updateClean(_load(), aclean);
			inited = true;
			_updateCount();
		}
		, toggle: function() {
			if (!inited) {
				return;
			}
			if (isClosed()) {
				_open();
			} else {
				_close();
			}
		}
		, findUser: _findUser
		, add: function(obj) {
			if (!inited) {
				return;
			}
			const _id = _getId(obj.id);
			(obj.action ? modArea : area).append(OmUtil.tmpl('#activity-stub', _id).data(obj));
			const a = $('#' + _id).addClass(obj.cssClass);
			const acpt = a.find('.activity-accept');
			if (obj.accept) {
				acpt.click(function() { _action('accept', obj.id); });
			} else {
				acpt.remove();
			}
			const dcln = a.find('.activity-decline');
			if (obj.decline) {
				dcln.click(function() { _action('decline', obj.id); });
			} else {
				dcln.remove();
			}
			const fnd = a.find('.activity-find');
			if (obj.find) {
				fnd.click(function() { _findUser(obj.uid); });
			} else {
				fnd.remove();
			}
			a.find('.activity-close').click(function() {
				_action('close', obj.id);
			});
			a.find('.activity-text').text(obj.text);
			_hightlight(obj.action);
			if (aclean.prop('checked') && a.hasClass('auto-clean')) {
				setTimeout(_clearItem.bind(null, obj.id), timeout);
			}
			_updateCount();
		}
		, remove: _remove
	};
}();
/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var Video = (function() {
	const self = {}, states = []
		, AudioCtx = window.AudioContext || window.webkitAudioContext;
	let sd, v, vc, t, footer, size, vol, iceServers
		, lm, level, userSpeaks = false, muteOthers
		, hasVideo, isSharing, isRecording;

	function __getVideo(_state) {
		const vid = self.video(_state);
		return vid && vid.length > 0 ? vid[0] : null;
	}
	function _resizeDlgArea(_w, _h) {
		if (Room.getOptions().interview) {
			VideoUtil.setPos(v, VideoUtil.getPos());
		} else if (v.dialog('instance')) {
			v.dialog('option', 'width', _w).dialog('option', 'height', _h);
		}
	}
	function _micActivity(speaks) {
		if (speaks !== userSpeaks) {
			userSpeaks = speaks;
			OmUtil.sendMessage({type: 'mic', id: 'activity', active: speaks});
		}
	}
	function _getScreenStream(msg, state, callback) {
		function __handleScreenError(err) {
			VideoManager.sendMessage({id: 'errorSharing'});
			Sharer.setShareState(SHARE_STOPPED);
			Sharer.setRecState(SHARE_STOPPED);
			OmUtil.error(err);
		}
		const b = kurentoUtils.WebRtcPeer.browser;
		let promise, cnts;
		if (VideoUtil.isEdge(b) && b.major > 16) {
			cnts = {
				video: true
			};
			promise = navigator.getDisplayMedia(cnts);
		} else if (b.name === 'Firefox') {
			// https://mozilla.github.io/webrtc-landing/gum_test.html
			cnts = Sharer.baseConstraints(sd);
			cnts.video.mediaSource = sd.shareType;
			promise = navigator.mediaDevices.getUserMedia(cnts);
		} else if (VideoUtil.sharingSupported()) {
			cnts = {
				video: true
			};
			promise = navigator.mediaDevices.getDisplayMedia(cnts);
		} else {
			promise = new Promise(() => {
				Sharer.close();
				throw 'Screen-sharing is not supported in ' + b.name + '[' + b.major + ']';
			});
		}
		promise.then(stream => {
			if (!state.disposed) {
				__createVideo(state);
				state.stream = stream;
				callback(msg, state, cnts);
			}
		}).catch(__handleScreenError);
	}
	function _getVideoStream(msg, state, callback) {
		VideoSettings.constraints(sd, function(cnts) {
			if ((VideoUtil.hasCam(sd) && !cnts.video) || (VideoUtil.hasMic(sd) && !cnts.audio)) {
				VideoManager.sendMessage({
					id : 'devicesAltered'
					, uid: sd.uid
					, audio: !!cnts.audio
					, video: !!cnts.video
				});
			}
			if (!cnts.audio && !cnts.video) {
				OmUtil.error('Requested devices are not available');
				VideoManager.close(sd.uid)
				return;
			}
			navigator.mediaDevices.getUserMedia(cnts)
				.then(stream => {
					if (state.disposed || msg.instanceUid !== v.data('instance-uid')) {
						return;
					}
					state.localStream = stream;
					let _stream = stream;
					const data = {};
					if (stream.getAudioTracks().length !== 0) {
						lm = vc.find('.level-meter');
						lm.show();
						data.aCtx = new AudioCtx();
						data.gainNode = data.aCtx.createGain();
						data.analyser = data.aCtx.createAnalyser();
						data.aSrc = data.aCtx.createMediaStreamSource(stream);
						data.aSrc.connect(data.gainNode);
						data.gainNode.connect(data.analyser);
						if (VideoUtil.isEdge()) {
							data.analyser.connect(data.aCtx.destination);
						} else {
							data.aDest = data.aCtx.createMediaStreamDestination();
							data.analyser.connect(data.aDest);
							_stream = data.aDest.stream;
							stream.getVideoTracks().forEach(function(track) {
								_stream.addTrack(track);
							});
						}
					}
					state.data = data;
					__createVideo(state);
					state.stream = _stream;
					callback(msg, state, cnts);
				})
				.catch(function(err) {
					VideoManager.sendMessage({
						id : 'devicesAltered'
						, uid: sd.uid
						, audio: false
						, video: false
					});
					VideoManager.close(sd.uid);
					if ('NotReadableError' === err.name) {
						OmUtil.error('Camera/Microphone is busy and can\'t be used');
					} else {
						OmUtil.error(err);
					}
				});
		});
	}
	function __attachListener(state) {
		if (!state.disposed && state.data.rtcPeer) {
			const pc = state.data.rtcPeer.peerConnection;
			pc.onconnectionstatechange = function(event) {
				console.warn(`!!RTCPeerConnection state changed: ${pc.connectionState}, user: ${sd.user.displayName}, uid: ${sd.uid}`);
				switch(pc.connectionState) {
					case "connected":
						if (sd.self) {
							// The connection has become fully connected
							OmUtil.alert('info', `Connection to Media server has been established`, 3000);//notify user
						}
						break;
					case "disconnected":
					case "failed":
						//connection has been dropped
						OmUtil.alert('warning', `Media server connection for user ${sd.user.displayName} is ${pc.connectionState}, will try to re-connect`, 3000);//notify user
						_refresh();
						break;
					case "closed":
						// The connection has been closed
						break;
				}
			}
		}
	}
	function __createSendPeer(msg, state, cnts) {
		state.options = {
			videoStream: state.stream
			, mediaConstraints: cnts
			, onicecandidate: self.onIceCandidate
		};
		if (!isSharing) {
			state.options.localVideo = __getVideo(state);
		}
		const data = state.data;
		data.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(
			VideoUtil.addIceServers(state.options, msg)
			, function (error) {
				if (state.disposed || true === data.rtcPeer.cleaned) {
					return;
				}
				if (error) {
					return OmUtil.error(error);
				}
				if (data.analyser) {
					level = MicLevel();
					level.meter(data.analyser, lm, _micActivity, OmUtil.error);
				}
				data.rtcPeer.generateOffer(function(genErr, offerSdp) {
					if (state.disposed || true === data.rtcPeer.cleaned) {
						return;
					}
					if (genErr) {
						return OmUtil.error('Sender sdp offer error ' + genErr);
					}
					OmUtil.log('Invoking Sender SDP offer callback function');
					const bmsg = {
							id : 'broadcastStarted'
							, uid: sd.uid
							, sdpOffer: offerSdp
						}, vtracks = state.stream.getVideoTracks();
					if (vtracks && vtracks.length > 0) {
						const vts = vtracks[0].getSettings();
						bmsg.width = vts.width;
						bmsg.height = vts.height;
						bmsg.fps = vts.frameRate;
					}
					VideoManager.sendMessage(bmsg);
					if (isSharing) {
						Sharer.setShareState(SHARE_STARTED);
					}
					if (isRecording) {
						Sharer.setRecState(SHARE_STARTED);
					}
				});
			});
		data.rtcPeer.cleaned = false;
		__attachListener(state);
	}
	function _createSendPeer(msg, state) {
		if (isSharing || isRecording) {
			_getScreenStream(msg, state, __createSendPeer);
		} else {
			_getVideoStream(msg, state, __createSendPeer);
		}
	}
	function _createResvPeer(msg, state) {
		__createVideo(state);
		const options = VideoUtil.addIceServers({
			remoteVideo : __getVideo(state)
			, onicecandidate : self.onIceCandidate
		}, msg);
		const data = state.data;
		data.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(
			options
			, function(error) {
				if (state.disposed || true === data.rtcPeer.cleaned) {
					return;
				}
				if (error) {
					return OmUtil.error(error);
				}
				data.rtcPeer.generateOffer(function(genErr, offerSdp) {
					if (state.disposed || true === data.rtcPeer.cleaned) {
						return;
					}
					if (genErr) {
						return OmUtil.error('Receiver sdp offer error ' + genErr);
					}
					OmUtil.log('Invoking Receiver SDP offer callback function');
					VideoManager.sendMessage({
						id : 'addListener'
						, sender: sd.uid
						, sdpOffer: offerSdp
					});
				});
			});
		data.rtcPeer.cleaned = false;
		__attachListener(state);
	}
	function _handleMicStatus(state) {
		if (!footer || !footer.is(':visible')) {
			return;
		}
		if (state) {
			footer.text(footer.data('on'));
			footer.addClass('mic-on');
			t.addClass('mic-on');
		} else {
			footer.text(footer.data('off'));
			footer.removeClass('mic-on');
			t.removeClass('mic-on');
		}
	}
	function _initContainer(_id, name, opts, instanceUid) {
		let contSel = '#user' + sd.cuid;
		const _hasVideo = VideoUtil.hasVideo(sd)
		size = {width: _hasVideo ? sd.width : 120, height: _hasVideo ? sd.height : 90};
		hasVideo = _hasVideo || $(contSel).length < 1;
		if (hasVideo) {
			if (opts.interview) {
				const area = $('.pod-area');
				const contId = uuidv4();
				contSel = '#' + contId;
				area.append($('<div class="pod"></div>').attr('id', contId));
				WbArea.updateAreaClass();
			} else {
				contSel = '.room-block .room-container';
			}
		}
		$(contSel).append(OmUtil.tmpl('#user-video', _id)
				.attr('title', name)
				.attr('data-client-uid', sd.cuid)
				.attr('data-client-type', sd.type)
				.attr('data-instance-uid', instanceUid)
				.data(self));
		v = $('#' + _id);
		vc = v.find('.video');
		muteOthers = vc.find('.mute-others');
		_setRights();
		return contSel;
	}
	function _initDialog(v, opts) {
		if (opts.interview) {
			v.dialog('option', 'draggable', false);
			v.dialog('option', 'resizable', false);
			$('.pod-area').sortable('refresh');
		} else {
			v.dialog('option', 'draggable', true);
			v.dialog('option', 'resizable', true);
			if (isSharing) {
				v.on('dialogclose', function() {
					VideoManager.close(sd.uid, true);
				});
			}
		}
		_initDialogBtns(opts);
	}
	function _initDialogBtns(opts) {
		function noDblClick(e) {
			e.dblclick(function(e) {
				e.stopImmediatePropagation();
				return false;
			});
		}
		v.parent().find('.ui-dialog-titlebar-close').remove();
		v.parent().append(OmUtil.tmpl('#video-button-bar'));
		const refresh = v.parent().find('.btn-refresh')
			, tgl = v.parent().find('.btn-toggle')
			, cls = v.parent().find('.btn-wclose');
		if (isSharing) {
			cls.click(function (e) {
				v.dialog('close');
				return false;
			});
			noDblClick(cls);
			refresh.remove();
		} else {
			cls.remove();
			refresh.click(function(e) {
				e.stopImmediatePropagation();
				_refresh();
				return false;
			});
		}
		if (opts.interview) {
			tgl.remove();
		} else {
			tgl.click(function (e) {
				e.stopImmediatePropagation();
				$(this).toggleClass('minimized');
				v.toggle();
				return false;
			});
			noDblClick(tgl);
		}
	}
	function _init(msg) {
		sd = msg.stream;
		msg.instanceUid = uuidv4();
		if (!vol) {
			vol = Volume();
		}
		iceServers = msg.iceServers;
		sd.activities = sd.activities.sort();
		isSharing = VideoUtil.isSharing(sd);
		isRecording = VideoUtil.isRecording(sd);
		const _id = VideoUtil.getVid(sd.uid)
			, name = sd.user.displayName
			, _w = sd.width
			, _h = sd.height
			, opts = Room.getOptions();
		sd.self = sd.cuid === opts.uid;
		const contSel = _initContainer(_id, name, opts, msg.instanceUid);
		footer = v.find('.footer');
		if (!opts.showMicStatus) {
			footer.hide();
		}
		if (!sd.self && isSharing) {
			Sharer.close();
		}
		if (sd.self && (isSharing || isRecording)) {
			v.hide();
		} else if (hasVideo) {
			v.dialog({
				classes: {
					'ui-dialog': 'video user-video' + (opts.showMicStatus ? ' mic-status' : '')
					, 'ui-dialog-titlebar': '' + (opts.showMicStatus ? ' ui-state-highlight' : '')
				}
				, width: _w
				, minWidth: 40
				, minHeight: 50
				, autoOpen: true
				, modal: false
				, appendTo: contSel
			});
			_initDialog(v, opts);
		}
		t = v.parent().find('.ui-dialog-titlebar').attr('title', name);
		v.on('remove', _cleanup);
		if (hasVideo) {
			vc.width(_w).height(_h);
		}

		_refresh(msg);
		return v;
	}
	function _update(_c) {
		const prevA = sd.activities
			, prevW = sd.width
			, prevH = sd.height
			, prevCam = sd.cam
			, prevMic = sd.mic;
		sd.activities = _c.activities.sort();
		sd.level = _c.level;
		sd.user.firstName = _c.user.firstName;
		sd.user.lastName = _c.user.lastName;
		sd.user.displayName = _c.user.displayName;
		sd.width = _c.width;
		sd.height = _c.height;
		sd.cam = _c.cam;
		sd.mic = _c.mic;
		const name = sd.user.displayName;
		if (hasVideo) {
			v.dialog('option', 'title', name).parent().find('.ui-dialog-titlebar').attr('title', name);
		}
		const same = prevA.length === sd.activities.length
			&& prevA.every(function(value, index) { return value === sd.activities[index]})
			&& prevW === sd.width && prevH === sd.height
			&& prevCam == sd.cam && prevMic === sd.mic;
		if (sd.self && !same) {
			_cleanup();
			v.remove();
			_init({stream: sd, iceServers: iceServers});
		}
	}
	function __createVideo(state) {
		const _id = VideoUtil.getVid(sd.uid);
		_resizeDlgArea(size.width, size.height);
		if (hasVideo && !isSharing && !isRecording) {
			VideoUtil.setPos(v, VideoUtil.getPos(VideoUtil.getRects(VIDWIN_SEL), sd.width, sd.height + 25));
		}
		state.video = $(hasVideo ? '<video>' : '<audio>').attr('id', 'vid' + _id)
			.attr('playsinline', 'playsinline')
			//.attr('autoplay', 'autoplay')
			.prop('controls', false)
			.width(vc.width()).height(vc.height());
		if (state.data) {
			state.video.data(state.data);
		}
		if (hasVideo) {
			vc.removeClass('audio-only').css('background-image', '');
			vc.parents('.ui-dialog').removeClass('audio-only');
			state.video.attr('poster', sd.user.pictureUri);
		} else {
			vc.addClass('audio-only');
		}
		vc.append(state.video);
		if (VideoUtil.hasMic(sd)) {
			const volIco = vol.create(self)
			if (hasVideo) {
				v.parent().find('.buttonpane').append(volIco);
			} else {
				volIco.addClass('ulist-small');
				volIco.insertAfter('#user' + sd.cuid + ' .typing-activity');
			}
		} else {
			vol.destroy();
		}
	}
	function _refresh(_msg) {
		const msg = _msg || {
			iceServers: iceServers
			, instanceUid: v.length > 0 ? v.data('instance-uid') : undefined
		};
		if (sd.self) {
			VideoManager.sendMessage({
				id : 'broadcastRestarted'
				, uid: sd.uid
			});
		}
		_cleanup();
		const hasAudio = VideoUtil.hasMic(sd)
			, state = {
				disposed: false
				, data: {}
			};
		states.push(state);
		if (sd.self) {
			_createSendPeer(msg, state);
		} else {
			_createResvPeer(msg, state);
		}
		_handleMicStatus(hasAudio);
	}
	function _setRights() {
		if (Room.hasRight(['MUTE_OTHERS']) && VideoUtil.hasMic(sd)) {
			muteOthers.addClass('enabled').off().click(function() {
				VideoManager.clickMuteOthers(sd.cuid);
			});
		} else {
			muteOthers.removeClass('enabled').off();
		}
	}
	function _cleanData(data) {
		if (!data) {
			return;
		}
		if (data.analyser) {
			VideoUtil.disconnect(data.analyser);
			data.analyser = null;
		}
		if (data.gainNode) {
			VideoUtil.disconnect(data.gainNode);
			data.gainNode = null;
		}
		if (data.aSrc) {
			VideoUtil.cleanStream(data.aSrc.mediaStream);
			VideoUtil.disconnect(data.aSrc);
			data.aSrc = null;
		}
		if (data.aDest) {
			VideoUtil.disconnect(data.aDest);
			data.aDest = null;
		}
		if (data.aCtx) {
			if (data.aCtx.destination) {
				VideoUtil.disconnect(data.aCtx.destination);
			}
			if ('closed' !== data.aCtx.state) {
				try {
					data.aCtx.close();
				} catch(e) {
					console.error(e);
				}
			}
			data.aCtx = null;
		}
		VideoUtil.cleanPeer(data.rtcPeer);
		data.rtcPeer = null;
	}
	function _cleanup(evt) {
		OmUtil.log('!!Disposing participant ' + sd.uid);
		let state;
		while(state = states.pop()) {
			state.disposed = true;
			if (state.options) {
				delete state.options.videoStream;
				delete state.options.mediaConstraints;
				delete state.options.onicecandidate;
				delete state.options.localVideo;
				state.options = null;
			}
			_cleanData(state.data);
			VideoUtil.cleanStream(state.localStream);
			VideoUtil.cleanStream(state.stream);
			state.data = null;
			state.localStream = null;
			state.stream = null;
			const video = state.video;
			if (video && video.length > 0) {
				video.attr('id', 'dummy');
				const vidNode = video[0];
				VideoUtil.cleanStream(vidNode.srcObject);
				vidNode.srcObject = null;
				vidNode.load();
				vidNode.removeAttribute("src");
				vidNode.removeAttribute("srcObject");
				vidNode.parentNode.removeChild(vidNode);
				state.video.data({});
				state.video = null;
			}
		}
		if (lm && lm.length > 0) {
			_micActivity(false);
			lm.hide();
			muteOthers.removeClass('enabled').off();
		}
		if (level) {
			level.dispose();
			level = null;
		}
		vc.find('audio,video').remove();
		vol.destroy();
		if (evt && evt.target) {
			$(evt).off();
		}
	}
	function _reattachStream() {
		states.forEach(state => {
			if (state.video && state.video.length > 0) {
				const data = state.data
					, videoEl = state.video[0];
				if (data.rtcPeer && (!videoEl.srcObject || !videoEl.srcObject.active)) {
					videoEl.srcObject = sd.self ? data.rtcPeer.getLocalStream() : data.rtcPeer.getRemoteStream();
				}
			}
		});
	}
	function _processSdpAnswer(answer) {
		const state = states.length > 0 ? states[0] : null;
		if (!state || state.disposed || !state.data.rtcPeer || state.data.rtcPeer.cleaned) {
			return;
		}
		state.data.rtcPeer.processAnswer(answer, function (error) {
			if (true === this.cleaned) {
				return;
			}
			const video = __getVideo(state);
			if (this.peerConnection.signalingState === 'stable' && video && video.paused) {
				video.play().catch(function (err) {
					if ('NotAllowedError' === err.name) {
						VideoUtil.askPermission(function () {
							video.play();
						});
					}
				});
				return;
			}
			if (error) {
				OmUtil.error(error, true);
			}
		});
	}
	function _processIceCandidate(candidate) {
		const state = states.length > 0 ? states[0] : null;
		if (!state || state.disposed || !state.data.rtcPeer || state.data.rtcPeer.cleaned) {
			return;
		}
		state.data.rtcPeer.addIceCandidate(candidate, function (error) {
			if (true === this.cleaned) {
				return;
			}
			if (error) {
				OmUtil.error('Error adding candidate: ' + error, true);
			}
		});
	}

	self.update = _update;
	self.refresh = _refresh;
	self.mute = function(_mute) {
		vol.mute(_mute);
	};
	self.isMuted = function() {
		return vol.muted();
	};
	self.init = _init;
	self.stream = function() { return sd; };
	self.setRights = _setRights;
	self.processSdpAnswer = _processSdpAnswer;
	self.processIceCandidate = _processIceCandidate;
	self.onIceCandidate = function(candidate) {
		const opts = Room.getOptions();
		OmUtil.log('Local candidate ' + JSON.stringify(candidate));
		VideoManager.sendMessage({
			id: 'onIceCandidate'
			, candidate: candidate
			, uid: sd.uid
			, luid: sd.self ? sd.uid : opts.uid
		});
	};
	self.reattachStream = _reattachStream;
	self.video = function(_state) {
		const state = _state || (states.length > 0 ? states[0] : null);
		if (!state || state.disposed) {
			return null;
		}
		return state.video;
	};
	self.handleMicStatus = _handleMicStatus;
	return self;
});
/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var VideoManager = (function() {
	const self = {};
	let share, inited = false;

	function _onVideoResponse(m) {
		const w = $('#' + VideoUtil.getVid(m.uid))
			, v = w.data();
		if (v) {
			v.processSdpAnswer(m.sdpAnswer);
		}
	}
	function _onBroadcast(msg) {
		const sd = msg.stream
			, uid = sd.uid;
		if (Array.isArray(msg.cleanup)) {
			msg.cleanup.forEach(function(_cuid) {
				_close(_cuid);
			});
		}
		$('#' + VideoUtil.getVid(uid)).remove();
		Video().init(msg);
		OmUtil.log(uid + ' registered in room');
	}
	function _onShareUpdated(msg) {
		const sd = msg.stream
			, uid = sd.uid
			, w = $('#' + VideoUtil.getVid(uid))
			, v = w.data();
		if (v && (VideoUtil.isSharing(sd) || VideoUtil.isRecording(sd))) {
			// Update activities in the current data object
			v.stream().activities = sd.activities;
		}
		Sharer.setShareState(VideoUtil.isSharing(sd) ? SHARE_STARTED : SHARE_STOPPED);
		Sharer.setRecState(VideoUtil.isRecording(sd) ? SHARE_STARTED : SHARE_STOPPED);
	}
	function _onReceive(msg) {
		const uid = msg.stream.uid;
		_closeV($('#' + VideoUtil.getVid(uid)));
		Video().init(msg);
		OmUtil.log(uid + ' receiving video');
	}
	function _onKMessage(m) {
		switch (m.id) {
			case 'clientLeave':
				$(VID_SEL + '[data-client-uid="' + m.uid + '"]').each(function() {
					_closeV($(this));
				});
				if (share.data('cuid') === m.uid) {
					share.off().hide();
				}
				break;
			case 'broadcastStopped':
				_close(m.uid, false);
				break;
			case 'broadcast':
				_onBroadcast(m);
				break;
			case 'videoResponse':
				_onVideoResponse(m);
				break;
			case 'iceCandidate':
				{
					const w = $('#' + VideoUtil.getVid(m.uid))
						, v = w.data();
					if (v) {
						v.processIceCandidate(m.candidate);
					}
				}
				break;
			case 'newStream':
				_play([m.stream], m.iceServers);
				break;
			case 'shareUpdated':
				_onShareUpdated(m);
				break;
			case 'error':
				OmUtil.error(m.message);
				break;
			default:
				//no-op
		}
	}
	function _onWsMessage(jqEvent, msg) {
		try {
			if (msg instanceof Blob) {
				return; //ping
			}
			const m = JSON.parse(msg);
			if (!m) {
				return;
			}
			if ('kurento' === m.type && 'test' !== m.mode) {
				OmUtil.info('Received message: ' + msg);
				_onKMessage(m);
			} else if ('mic' === m.type) {
				switch (m.id) {
					case 'activity':
						_userSpeaks(m.uid, m.active);
						break;
					default:
						//no-op
				}
			}
		} catch (err) {
			OmUtil.error(err);
		}
	}
	function _init() {
		Wicket.Event.subscribe('/websocket/message', _onWsMessage);
		VideoSettings.init(Room.getOptions());
		share = $('.room-block .room-container').find('.btn.shared');
		inited = true;
	}
	function _update(c) {
		if (!inited) {
			return;
		}
		const streamMap = {};
		c.streams.forEach(function(sd) {
			streamMap[sd.uid] = sd.uid;
			sd.self = c.self;
			sd.cam = c.cam;
			sd.mic = c.mic;
			if (VideoUtil.isSharing(sd) || VideoUtil.isRecording(sd)) {
				return;
			}
			const _id = VideoUtil.getVid(sd.uid)
				, av = VideoUtil.hasMic(sd) || VideoUtil.hasCam(sd)
				, v = $('#' + _id);
			if (av && v.length === 1) {
				v.data().update(sd);
			} else if (!av && v.length === 1) {
				_closeV(v);
			}
		});
		if (c.uid === Room.getOptions().uid) {
			$(VID_SEL).each(function() {
				$(this).data().setRights(c.rights);
			});
		}
		$('[data-client-uid="' + c.cuid + '"]').each(function() {
			const sd = $(this).data().stream();
			if (!streamMap[sd.uid]) {
				//not-inited/invalid video window
				_closeV($(this));
			}
		});
	}
	function _closeV(v) {
		if (!v || v.length < 1) {
			return;
		}
		if (v.dialog('instance') !== undefined) {
			v.dialog('destroy');
		}
		v.parents('.pod').remove();
		v.remove();
		WbArea.updateAreaClass();
	}
	function _playSharing(sd, iceServers) {
		const m = {stream: sd, iceServers: iceServers};
		let v = $('#' + VideoUtil.getVid(sd.uid))
		if (v.length === 1) {
			v.remove();
		}
		v = Video().init(m);
		VideoUtil.setPos(v, {left: 0, top: 35});
	}
	function _play(streams, iceServers) {
		if (!inited) {
			return;
		}
		streams.forEach(function(sd) {
			const m = {stream: sd, iceServers: iceServers};
			if (VideoUtil.isSharing(sd)) {
				VideoUtil.highlight(share
						.attr('title', share.data('user') + ' ' + sd.user.firstName + ' ' + sd.user.lastName + ' ' + share.data('text'))
						.data('uid', sd.uid)
						.data('cuid', sd.cuid)
						.show()
					, 'btn-outline-warning', 10);
				share.tooltip().off().click(function() {
					_playSharing(sd, iceServers);
				});
				if (Room.getOptions().autoOpenSharing === true) {
					_playSharing(sd, iceServers);
				}
			} else if (VideoUtil.isRecording(sd)) {
				return;
			} else {
				_onReceive(m);
			}
		});
	}
	function _close(uid, showShareBtn) {
		const v = $('#' + VideoUtil.getVid(uid));
		if (v.length === 1) {
			_closeV(v);
		}
		if (!showShareBtn && uid === share.data('uid')) {
			share.off().hide();
		}
	}
	function _find(uid) {
		return $(VID_SEL + '[data-client-uid="' + uid + '"][data-client-type="WEBCAM"]');
	}
	function _userSpeaks(uid, active) {
		const u = $('#user' + uid + ' .audio-activity')
			, v = _find(uid).parent();
		if (active) {
			u.addClass('speaking');
			v.addClass('user-speaks')
		} else {
			u.removeClass('speaking');
			v.removeClass('user-speaks')
		}
	}
	function _refresh(uid, opts) {
		const v = _find(uid);
		if (v.length > 0) {
			v.data().refresh(opts);
		}
	}
	function _mute(uid, mute) {
		const v = _find(uid);
		if (v.length > 0) {
			v.data().mute(mute);
		}
	}
	function _clickMuteOthers(uid) {
		const s = VideoSettings.load();
		if (false !== s.video.confirmMuteOthers) {
			const dlg = $('#muteothers-confirm');
			dlg.dialog({
				appendTo: ".room-container"
				, buttons: [
					{
						text: dlg.data('btn-ok')
						, click: function() {
							s.video.confirmMuteOthers = !$('#muteothers-confirm-dont-show').prop('checked');
							VideoSettings.save();
							OmUtil.roomAction({action: 'muteOthers', uid: uid});
							$(this).dialog('close');
						}
					}
					, {
						text: dlg.data('btn-cancel')
						, click: function() {
							$(this).dialog('close');
						}
					}
				]
			})
		} else {
			OmUtil.roomAction({action: 'muteOthers', uid: uid});
		}
	}
	function _muteOthers(uid) {
		$(VID_SEL).each(function() {
			const w = $(this), v = w.data(), v2 = w.data('client-uid');
			if (v && v2) {
				v.mute(uid !== v2);
			}
		});
	}
	function _toggleActivity(activity) {
		self.sendMessage({
			id: 'toggleActivity'
			, activity: activity
		});
	}

	self.init = _init;
	self.update = _update;
	self.play = _play;
	self.close = _close;
	self.refresh = _refresh;
	self.mute = _mute;
	self.clickMuteOthers = _clickMuteOthers;
	self.muteOthers = _muteOthers;
	self.toggleActivity = _toggleActivity;
	self.sendMessage = function(_m) {
		OmUtil.sendMessage(_m, {type: 'kurento'});
	}
	self.destroy = function() {
		Wicket.Event.unsubscribe('/websocket/message', _onWsMessage);
	}
	return self;
})();
/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var SHARE_STARTING = 'starting';
var SHARE_STARTED = 'started';
var SHARE_STOPPED = 'stopped';
var Sharer = (function() {
	const self = {};
	let sharer, type, fps, sbtn, rbtn
		, shareState = SHARE_STOPPED, recState = SHARE_STOPPED;

	/**
	 * Re-entering the room should reset settings.
	 */
	function reset() {
		shareState = SHARE_STOPPED;
		recState = SHARE_STOPPED;
	}

	function _init() {
		reset();
		sharer = $('#sharer').dialog({
			classes: {
				'ui-dialog': 'sharer'
				, 'ui-dialog-titlebar': ''
			}
			, width: 450
			, autoOpen: false
			, resizable: false
		});
		fixJQueryUIDialogTouch(sharer);

		if (!VideoUtil.sharingSupported()) {
			sharer.find('.container').remove();
			sharer.find('.alert').show();
		} else {
			type = sharer.find('select.type');
			const b = kurentoUtils.WebRtcPeer.browser;
			fps = sharer.find('select.fps');
			_disable(fps, VideoUtil.isEdge(b));
			sbtn = sharer.find('.share-start-stop').off().click(function() {
				if (shareState === SHARE_STOPPED) {
					_setShareState(SHARE_STARTING);
					VideoManager.sendMessage({
						id: 'wannaShare'
						, shareType: type.val()
						, fps: fps.val()
					});
				} else {
					VideoManager.sendMessage({
						id: 'pauseSharing'
						, uid: _getShareUid()
					});
				}
			});
			rbtn = sharer.find('.record-start-stop').off();
			if (Room.getOptions().allowRecording) {
				rbtn.show().click(function() {
					if (recState === SHARE_STOPPED) {
						_setRecState(SHARE_STARTING);
						VideoManager.sendMessage({
							id: 'wannaRecord'
							, shareType: type.val()
							, fps: fps.val()
						});
					} else {
						VideoManager.sendMessage({
							id: 'stopRecord'
							, uid: _getShareUid()
						});
					}
				});
			} else {
				rbtn.hide();
			}
		}
	}
	function _disable(e, state) {
		e.prop('disabled', state);
		if (state) {
			e.addClass('disabled');
		} else {
			e.removeClass('disabled');
		}
	}
	function _typeDisabled(_b) {
		const b = _b || kurentoUtils.WebRtcPeer.browser;
		return VideoUtil.isEdge(b) || VideoUtil.isChrome(b) || VideoUtil.isEdgeChromium(b);
	}
	function _setBtnState(btn, state) {
		const dis = SHARE_STOPPED !== state
			, typeDis = _typeDisabled();
		_disable(type, dis);
		_disable(fps, dis || typeDis);
		btn.find('span').text(btn.data(dis ? 'stop' : 'start'));
		if (dis) {
			btn.addClass('stop');
		} else {
			btn.removeClass('stop');
		}
		_disable(btn, state === SHARE_STARTING);
		_disable(btn, state === SHARE_STARTING);
	}
	function _setShareState(state) {
		shareState = state;
		_setBtnState(sbtn, state);
	}
	function _setRecState(state) {
		recState = state;
		_setBtnState(rbtn, state);
	}
	function _getShareUid() {
		const v = $('div[data-client-uid="' + Room.getOptions().uid + '"][data-client-type="SCREEN"]');
		return v && v.data() && v.data().stream() ? v.data().stream().uid : '';
	}

	self.init = _init;
	self.open = function() {
		if (sharer && sharer.dialog('instance')) {
			sharer.dialog('open');
		}
	};
	self.close = function() {
		if (sharer && sharer.dialog('instance')) {
			sharer.dialog('close');
		}
	};
	self.setShareState = _setShareState;
	self.setRecState = _setRecState;
	self.baseConstraints = function(sd) {
		return {
			video: {
				frameRate: {
					ideal: sd.fps
				}
			}
			, audio: false
		};
	};
	return self;
})();
/* Licensed under the Apache License, Version 2.0 (the "License") http://www.apache.org/licenses/LICENSE-2.0 */
var Room = (function() {
	const self = {}, sbSide = Settings.isRtl ? 'right' : 'left';
	let options, menuHeight, sb, dock, activities, noSleep;

	function _init(_options) {
		options = _options;
		window.WbArea = options.interview ? InterviewWbArea() : DrawWbArea();
		const menu = $('.room-block .room-container .menu');
		activities = $('#activities');
		sb = $('.room-block .sidebar');
		sb.width(sb.width()); // this is required to 'fix' the width so it will not depend on CSS var
		dock = sb.find('.btn-dock').click(function() {
			const offset = parseInt(sb.css(sbSide));
			if (offset < 0) {
				sb.removeClass('closed');
			}
			dock.prop('disabled', true);
			const props = {};
			props[sbSide] = offset < 0 ? '0px' : (-sb.width() + 45) + 'px';
			sb.animate(props, 1500
				, function() {
					dock.prop('disabled', false);
					__dockSetMode(offset < 0);
					_setSize();
				});
		});
		__dockSetMode(true);
		const header = $('#room-sidebar-tab-users .header');
		header.find('.om-icon.settings').off().click(VideoSettings.open);
		header.find('.om-icon.activity.cam').off().click(function() {
			VideoManager.toggleActivity('VIDEO');
		});
		header.find('.om-icon.activity.mic').off().click(function() {
			VideoManager.toggleActivity('AUDIO');
		});
		menuHeight = menu.length === 0 ? 0 : menu.height();
		VideoManager.init();
		if (typeof(Activities) !== 'undefined') {
			Activities.init();
		}
		Sharer.init();
		_setSize();
	}
	function __dockSetMode(mode) {
		const icon = dock.find('i').removeClass('icon-dock icon-undock');
		if (mode) {
			icon.addClass('icon-undock');
			dock.attr('title', dock.data('ttl-undock'))
				.find('.sr-only').text(dock.data('ttl-undock'));
			_sbAddResizable();
		} else {
			icon.addClass('icon-dock');
			dock.attr('title', dock.data('ttl-dock'))
				.find('.sr-only').text(dock.data('ttl-dock'));
			sb.addClass('closed').resizable('destroy');
		}
	}
	function _getSelfAudioClient() {
		const vw = $('.video-container[data-client-type=WEBCAM][data-client-uid=' + Room.getOptions().uid + ']');
		if (vw.length > 0) {
			const v = vw.first().data();
			if (VideoUtil.hasMic(v.stream())) {
				return v;
			}
		}
		return null;
	}
	function _preventKeydown(e) {
		const base = $(e.target);
		if (e.target.isContentEditable === true || base.is('textarea, input:not([readonly]):not([type=radio]):not([type=checkbox])')) {
			return;
		}
		if (e.which === 8) { // backspace
			e.preventDefault();
			e.stopImmediatePropagation();
			return false;
		}
	}
	function __keyPressed(hotkey, e) {
		const code = OmUtil.getKeyCode(e);
		return hotkey.alt === e.altKey
			&& hotkey.ctrl === e.ctrlKey
			&& hotkey.shift === e.shiftKey
			&& hotkey.code.toUpperCase() === (code ? code.toUpperCase() : '');
	}
	function _keyHandler(e) {
		if (__keyPressed(options.keycode.arrange, e)) {
			VideoUtil.arrange();
		} else if (__keyPressed(options.keycode.arrangeresize, e)) {
			VideoUtil.arrangeResize();
		} else if (__keyPressed(options.keycode.muteothers, e)) {
			const v = _getSelfAudioClient();
			if (v !== null) {
				VideoManager.clickMuteOthers(Room.getOptions().uid);
			}
		} else if (__keyPressed(options.keycode.mute, e)) {
			const v = _getSelfAudioClient();
			if (v !== null) {
				v.mute(!v.isMuted());
			}
		} else if (__keyPressed(options.keycode.quickpoll, e)) {
			quickPollAction('open');
		}
		if (e.which === 27) {
			$('#wb-rename-menu').hide();
		}
	}
	function _mouseHandler(e) {
		if (e.which === 1) {
			$('#wb-rename-menu').hide();
		}
	}
	function _sbWidth() {
		if (sb === undefined) {
			sb = $('.room-block .sidebar');
		}
		return sb === undefined ? 0 : sb.width() + parseInt(sb.css(sbSide));
	}
	function _setSize() {
		const sbW = _sbWidth()
			, holder = $('.room-block');
		($('.main.room')[0]).style.setProperty('--sidebar-width', sbW + 'px');
		if (sbW > 285) {
			holder.addClass('big').removeClass('narrow');
		} else {
			holder.removeClass('big').addClass('narrow');
		}
	}
	function _reload() {
		if (!!options && !!options.reloadUrl) {
			window.location.href = options.reloadUrl;
		} else {
			window.location.reload();
		}
	}
	function _close() {
		_unload();
		$(".room-block").remove();
		$("#chatPanel").remove();
		$('#disconnected-dlg')
			.modal('show')
			.off('hide.bs.modal')
			.on('hide.bs.modal', _reload);
	}
	function _sbAddResizable() {
		sb.resizable({
			handles: Settings.isRtl ? 'w' : 'e'
			, stop: function() {
				_setSize();
			}
		});
	}
	function _load() {
		$('body').addClass('no-header');
		Wicket.Event.subscribe("/websocket/closed", _close);
		Wicket.Event.subscribe("/websocket/error", _close);
		$(window).on('keydown.openmeetings', _preventKeydown);
		$(window).on('keyup.openmeetings', _keyHandler);
		$(window).on('keydown.om-sip', _sipKeyDown);
		$(window).on('keyup.om-sip', _sipKeyUp);
		$(document).click(_mouseHandler);
		_addNoSleep();
		_initSip();
	}
	function _addNoSleep() {
		_removeNoSleep();
		noSleep = new NoSleep();
		noSleep.enable();
	}
	function _removeNoSleep() {
		if (noSleep) {
			noSleep.disable();
			noSleep = null;
		}
	}
	function _unload() {
		$('body').removeClass('no-header');
		Wicket.Event.unsubscribe("/websocket/closed", _close);
		Wicket.Event.unsubscribe("/websocket/error", _close);
		if (typeof(WbArea) === 'object') {
			WbArea.destroy();
			window.WbArea = undefined;
		}
		if (typeof(VideoSettings) === 'object') {
			VideoSettings.close();
		}
		if (typeof(VideoManager) === 'object') {
			VideoManager.destroy();
		}
		$('.ui-dialog.user-video').remove();
		$(window).off('keyup.openmeetings');
		$(window).off('keydown.openmeetings');
		$(window).off('keydown.om-sip');
		$(window).off('keyup.om-sip');
		$(document).off('click', _mouseHandler);
		sb = undefined;
		Sharer.close();
		_removeNoSleep();
	}
	function _showClipboard(txt) {
		const dlg = $('#clipboard-dialog');
		dlg.find('p .text').text(txt);
		dlg.dialog({
			resizable: false
			, height: "auto"
			, width: 400
			, modal: true
			, buttons: [
				{
					text: dlg.data('btn-ok')
					, click: function() {
						$(this).dialog('close');
					}
				}
			]
		});
	}
	function _hasRight(_inRights, _ref) {
		const ref = _ref || options.rights;
		let _rights;
		if (Array.isArray(_inRights)) {
			_rights = _inRights;
		} else {
			if ('SUPER_MODERATOR' === _inRights) {
				return ref.includes(_inRights);
			}
			_rights = [_inRights];
		}
		const rights = ['SUPER_MODERATOR', 'MODERATOR', ..._rights];
		for (let i = 0; i < rights.length; ++i) {
			if (ref.includes(rights[i])) {
				return true;
			}
		}
		return false;
	}
	function _setQuickPollRights() {
		const close = $('#quick-vote .close-btn');
		if (close.length === 1) {
			if (_hasRight(['PRESENTER'])) {
				close.show();
				if (typeof(close.data('bs.confirmation')) === 'object') {
					return;
				}
				close
					.confirmation({
						confirmationEvent: 'bla'
						, onConfirm: function() {
							quickPollAction('close');
						}
					});
			} else {
				close.hide();
			}
		}
	}
	function _quickPoll(obj) {
		if (obj.started) {
			let qv = $('#quick-vote');
			if (qv.length === 0) {
				const wbArea = $('.room-block .wb-block');
				qv = OmUtil.tmpl('#quick-vote-template', 'quick-vote');
				wbArea.append(qv);
			}
			const pro = qv.find('.control.pro')
				, con = qv.find('.control.con');
			if (obj.voted) {
				pro.removeClass('clickable').off();
				con.removeClass('clickable').off();
			} else {
				pro.addClass('clickable').off().click(function() {
					quickPollAction('vote', true);
				});
				con.addClass('clickable').off().click(function() {
					quickPollAction('vote', false);
				});
			}
			pro.find('.badge').text(obj.pros);
			con.find('.badge').text(obj.cons);
			_setQuickPollRights();
		} else {
			const qv = $('#quick-vote');
			if (qv.length === 1) {
				qv.remove();
			}
		}
		OmUtil.tmpl('#quick-vote-template', 'quick-vote');
	}
	function __activityAVIcon(elem, selector, predicate, onfunc, disabledfunc) {
		let icon = elem.find(selector);
		if (predicate()) {
			icon.show();
			const on = onfunc()
				, disabled = disabledfunc();
			if (disabled) {
				icon.addClass('disabled');
			} else {
				icon.removeClass('disabled');
				if (on) {
					icon.addClass('enabled');
				} else {
					icon.removeClass('enabled');
				}
			}
			icon.attr('title', icon.data(on ? 'on' :'off'));
		} else {
			icon.hide();
		}
	}
	function __activityIcon(elem, selector, predicate, action, confirm) {
		let icon = elem.find(selector);
		if (predicate()) {
			if (icon.length === 0) {
				icon = OmUtil.tmpl('#user-actions-stub ' + selector);
				elem.append(icon);
			}
			icon.off();
			if (confirm) {
				icon.confirmation('dispose');
				icon.confirmation(confirm)
			} else {
				icon.click(action);
			}
		} else {
			icon.hide();
		}
	}
	function __rightIcon(c, elem, rights, selector, predicate) {
		const self = c.uid === options.uid
			, hasRight = _hasRight(rights, c.rights);
		let icon = elem.find(selector);
		if (predicate() && !_hasRight('SUPER_MODERATOR', c.rights) && (
			(self && options.questions && !hasRight)
			|| (!self && _hasRight('MODERATOR'))
		)) {
			if (icon.length === 0) {
				icon = OmUtil.tmpl('#user-actions-stub ' + selector);
				elem.append(icon);
			}
			if (hasRight) {
				icon.addClass('granted');
			} else {
				icon.removeClass('granted')
			}
			icon.attr('title', icon.data(self ? 'request' : (hasRight ? 'revoke' : 'grant')));
			icon.off().click(function() {
				OmUtil.roomAction({action: 'toggleRight', right: rights[0], uid: c.uid});
			});
		} else {
			icon.remove();
		}
	}
	function __rightAudioIcon(c, elem) {
		__rightIcon(c, elem, ['AUDIO'], '.right.audio', () => true);
	}
	function __rightVideoIcon(c, elem) {
		__rightIcon(c, elem, ['VIDEO'], '.right.camera', () => !options.audioOnly);
	}
	function __rightOtherIcons(c, elem) {
		__rightIcon(c, elem, ['PRESENTER'], '.right.presenter', () => !options.interview && $('.wb-area').is(':visible'));
		__rightIcon(c, elem, ['WHITEBOARD', 'PRESENTER'], '.right.wb', () => !options.interview && $('.wb-area').is(':visible'));
		__rightIcon(c, elem, ['SHARE'], '.right.screen-share', () => true); //FIXME TODO getRoomPanel().screenShareAllowed()
		__rightIcon(c, elem, ['REMOTE_CONTROL'], '.right.remote-control', () => true); //FIXME TODO getRoomPanel().screenShareAllowed()
		__rightIcon(c, elem, ['MODERATOR'], '.right.moderator', () => true);
	}
	function __setStatus(c, le) {
		const status = le.find('.user-status')
			, mode = c.level == 5 ? 'mod' : (c.level == 3 ? 'wb' : 'user');
		status.removeClass('mod wb user');
		status.attr('title', status.data(mode)).addClass(mode);
		le.data('level', c.level);
	}
	function __updateCount() {
		$('#room-sidebar-users-tab .user-count').text($('#room-sidebar-tab-users .user-list .users .user.entry').length);
	}
	function __sortUserList() {
		const container = $('#room-sidebar-tab-users .user-list .users');
		container.find('.user.entry').sort((_u1, _u2) => {
			const u1 = $(_u1)
				, u2 = $(_u2);
			return u2.data('level') - u1.data('level') || u1.attr('title').localeCompare(u2.attr('title'));
		}).appendTo(container);
	}
	function _addClient(_clients) {
		if (!options) {
			return; //too early
		}
		const clients = Array.isArray(_clients) ? _clients : [_clients];
		clients.forEach(c => {
			const self = c.uid === options.uid;
			let le = Room.getClient(c.uid);
			if (le.length === 0) {
				le = OmUtil.tmpl('#user-entry-stub', 'user' + c.uid);
				le.attr('id', 'user' + c.uid)
					.attr('data-userid', c.user.id)
					.attr('data-uid', c.uid);
				if (self) {
					le.addClass('current');
				}
				$('#room-sidebar-tab-users .user-list .users').append(le);
			}
			_updateClient(c);
		});
		__updateCount();
		__sortUserList();
	}
	function _updateClient(c) {
		if (!options) {
			return; //too early
		}
		const self = c.uid === options.uid
			, le = Room.getClient(c.uid)
			, hasAudio = VideoUtil.hasMic(c)
			, hasVideo = VideoUtil.hasCam(c)
			, speaks = le.find('.audio-activity');
		if (le.length === 0) {
			return;
		}
		__setStatus(c, le);
		if (hasVideo || hasAudio) {
			if (le.find('.restart').length === 0) {
				le.prepend(OmUtil.tmpl('#user-av-restart').click(function () {
					VideoManager.refresh(c.uid);
				}));
			}
		} else {
			le.find('.restart').remove();
		}
		speaks.hide().removeClass('clickable').attr('title', speaks.data('speaks')).off();
		if (hasAudio) {
			speaks.show();
			if(_hasRight('MUTE_OTHERS')) {
				speaks.addClass('clickable').click(function () {
					VideoManager.clickMuteOthers(c.uid);
				}).attr('title', speaks.attr('title') + speaks.data('mute'));
			}
		}
		le.attr('title', c.user.displayName)
			.css('background-image', 'url(' + c.user.pictureUri + ')')
			.find('.user.name').text(c.user.displayName);

		const actions = le.find('.user.actions');
		__rightVideoIcon(c, actions);
		__rightAudioIcon(c, actions);
		__rightOtherIcons(c, actions);
		__activityIcon(actions, '.kick'
			, () => !self && _hasRight('MODERATOR') && !_hasRight('SUPER_MODERATOR', c.rights)
			, null
			, {
				confirmationEvent: 'om-kick'
				, placement: Settings.isRtl ? 'left' : 'right'
				, onConfirm: () => OmUtil.roomAction({action: 'kick', uid: c.uid})
			});
		__activityIcon(actions, '.private-chat'
				, () => options.userId !== c.user.id && $('#chatPanel').is(':visible')
				, function() {
					Chat.addTab('chatTab-u' + c.user.id, c.user.displayName);
					Chat.open();
					$('#chatMessage .wysiwyg-editor').click();
				});
		if (self) {
			options.rights = c.rights;
			_setQuickPollRights();
			options.activities = c.activities;
			const header = $('#room-sidebar-tab-users .header');
			__rightVideoIcon(c, header);
			__activityAVIcon(header, '.activity.cam', () => !options.audioOnly && _hasRight('VIDEO')
				, () => hasVideo
				, () => Settings.load().video.cam < 0);
			__rightAudioIcon(c, header);
			__activityAVIcon(header, '.activity.mic', () => _hasRight('AUDIO')
				, () => hasAudio
				, () => Settings.load().video.mic < 0);
			__rightOtherIcons(c, header);
		}
		VideoManager.update(c)
	}
	function __addSipText(v) {
		const txt = $('.sip-number');
		txt.val(txt.val() + v);
	}
	function __eraseSipText() {
		const txt = $('.sip-number')
			, t = txt.val();
		if (!!t) {
			txt.val(t.substring(0, t.length - 1));
		}
	}
	function _initSip() {
		$('.sip .button-row button').off().click(function() {
			__addSipText($(this).data('value'));
		});
		$('#sip-dialer-btn-erase').off().click(__eraseSipText);
	}
	function _sipGetKey(evt) {
		let k = -1;
		if (evt.keyCode > 47 && evt.keyCode < 58) {
			k = evt.keyCode - 48;
		}
		if (evt.keyCode > 95 && evt.keyCode < 106) {
			k = evt.keyCode - 96;
		}
		return k;
	}
	function _sipKeyDown(evt) {
		const k = _sipGetKey(evt);
		if (k > 0) {
			$('#sip-dialer-btn-' + k).addClass('bg-warning');
		}
	}
	function _sipKeyUp(evt) {
		if (evt.key === 'Backspace') {
			__eraseSipText();
		} else {
			const k = _sipGetKey(evt);
			if (k > 0) {
				$('#sip-dialer-btn-' + k).removeClass('bg-warning');
				__addSipText(k);
			}
		}
	}

	// Let's re-style jquery-ui dialogs and buttons
	$.extend($.ui.dialog.prototype.options.classes, {
		'ui-dialog': 'modal-content'
		, 'ui-dialog-titlebar': 'modal-header'
		, 'ui-dialog-title': 'modal-title'
		, 'ui-dialog-titlebar-close': 'close'
		, 'ui-dialog-content': 'modal-body'
		, 'ui-dialog-buttonpane': 'modal-footer'
	});
	$.extend($.ui.button.prototype.options.classes, {
		'ui-button': 'btn btn-outline-secondary'
	});
	self.init = _init;
	self.getMenuHeight = function() { return menuHeight; };
	self.getOptions = function() { return typeof(options) === 'object' ? JSON.parse(JSON.stringify(options)) : {}; };
	self.load = _load;
	self.unload = _unload;
	self.showClipboard = _showClipboard;
	self.quickPoll = _quickPoll;
	self.hasRight = _hasRight;
	self.setCssVar = function(key, val) {
		($('.main.room')[0]).style.setProperty(key, val);
	};
	self.addClient = _addClient;
	self.updateClient = function(c) {
		_updateClient(c);
		__sortUserList();
	};
	self.removeClient = function(uid) {
		Room.getClient(uid).remove();
		__updateCount();
	};
	self.removeOthers = function() {
		const selfUid = Room.getOptions().uid;
		$('.user-list .user.entry').each(function() {
			const c = $(this);
			if (c.data('uid') !== selfUid) {
				c.remove();
			}
		});
		__updateCount();
	};
	self.getClient = function(uid) {
		return $('#user' + uid);
	};
	return self;
})();
/***** functions required by SIP   ******/
function typingActivity(uid, active) {
	const u = Room.getClient(uid).find('.typing-activity');
	if (active) {
		u.addClass("typing");
	} else {
		u.removeClass("typing");
	}
}
