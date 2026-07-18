(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.animationUtilities = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @author jg, mattb
 */
"use strict";
var Motion = require("../ifr-motion/base/Motion");
//var MotionValidator = require("../ifr-motion/base/MotionValidator");
var MotionTrack = require("../ifr-motion/base/MotionTrack");
var TimestampedBuffer = require("../ifr-motion/base/TimestampedBuffer");
var AccelPlanner = require("../ifr-motion/base/AccelPlanner");
var TransitionBuilder = require("./TransitionBuilder");
/**
 * Protected constructor for internal use only.
 *
 * AccelerationTransitionBuilders generate transition motions using configurable
 * acceleration and velocity limits.
 *
 * AccelerationTransitionBuilders can be created via the animation module's
 * [createAccelerationTransitionBuilder]{@link jibo.animate#createAccelerationTransitionBuilder} method.
 *
 * @param {jibo.animate.RobotInfo} robotInfo - Protected constructor parameter.
 * @param {number} defaultMaxVelocity - Protected constructor parameter.
 * @param {number} defaultMaxAcceleration - Protected constructor parameter.
 * @class AccelerationTransitionBuilder
 * @memberof jibo.animate
 * @protected
 * @extends jibo.animate.TransitionBuilder
 */
var AccelerationTransitionBuilder = function (robotInfo, defaultMaxVelocity, defaultMaxAcceleration) {
    TransitionBuilder.call(this);
    /** @type {number} */
    /** @private */
    this.minTransitionTime = null;
    /** @type {number} */
    /** @private */
    this.defaultMaxVelocity = defaultMaxVelocity;
    /** @type {number} */
    /** @private */
    this.defaultMaxAccel = defaultMaxAcceleration;
    /** @type {Object<string,number>} */
    /** @private */
    this.maxVelocityByDOF = {};
    /** @type {Object<string,number>} */
    /** @private */
    this.maxAccelByDOF = {};
    /** @type {Object<string,boolean>} */
    /** @private */
    this.preferValueByDOF = {};
    /** @type {RobotInfo} */
    /** @private */
    this.robotInfo = robotInfo;
    /** @type {AccelPlanner} */
    /** @private */
    this.planner = new AccelPlanner();
};
AccelerationTransitionBuilder.prototype = Object.create(TransitionBuilder.prototype);
AccelerationTransitionBuilder.prototype.constructor = AccelerationTransitionBuilder;
/**
 * Sets this transition to use the specified max velocity and acceleration by default; i.e. for
 * all joints that do not have their own custom settings.
 * @method jibo.animate.AccelerationTransitionBuilder#setDefaultLimits
 * @param {number} defaultMaxVelocity - Max velocity to use by default.
 * @param {number} defaultMaxAcceleration - Max acceleration to use by default.
 */
AccelerationTransitionBuilder.prototype.setDefaultLimits = function (defaultMaxVelocity, defaultMaxAcceleration) {
    this.defaultMaxVelocity = defaultMaxVelocity;
    this.defaultMaxAccel = defaultMaxAcceleration;
};
/**
 * Sets this transition to use the specified minimum duration regardless of joint positions.
 * @method jibo.animate.AccelerationTransitionBuilder#setMinTransitionTime
 * @param {number} time - Minimum transition time.
 */
AccelerationTransitionBuilder.prototype.setMinTransitionTime = function (time) {
    this.minTransitionTime = time;
};
/**
 * Sets this transition to use the specified max velocity and acceleration for the specified joints/DOFs.
 * @method jibo.animate.AccelerationTransitionBuilder#setLimits
 * @param {string[]} dofNames - DOF names for which the specified limits should apply.
 * @param {number} maxVelocity - Max velocity to use for the specified DOFs.
 * @param {number} maxAcceleration - Max acceleration to use for the specified DOFs.
 */
AccelerationTransitionBuilder.prototype.setLimits = function (dofNames, maxVelocity, maxAcceleration) {
    for (var i = 0; i < dofNames.length; i++) {
        this.maxVelocityByDOF[dofNames[i]] = maxVelocity;
        this.maxAccelByDOF[dofNames[i]] = maxAcceleration;
    }
};
/**
 * Sets this transition to prefer the boolean value provided for the dofs listed.  Assumes the dofs described are
 * boolean valued dofs, behavior undefined if these dofs are metric.
 *
 * @param {string[]} dofNames - DOF names for which the specified limits should apply.
 * @param {number} preferValue - value to prefer, 0 or 1
 */
AccelerationTransitionBuilder.prototype.setPreferValue = function (dofNames, preferValue) {
    for (var i = 0; i < dofNames.length; i++) {
        this.preferValueByDOF[dofNames[i]] = preferValue;
    }
};
/**
 *
 * Generates a procedural transition motion using the configuration specified by this builder.
 * @method jibo.animate.AccelerationTransitionBuilder#generateTransition
 * @param {Pose} fromPose - Starting pose for the transition. Should have at least onDOFs, and also all unused DOFs (ancestors) required to calculate correct global paths.
 * @param {Motion} toMotion - Motion to use as the destination for the transition.  Should have at least onDOFs.
 * @param {number} timeOffsetInTo - Time offset to target in the destination motion.
 * @param {string[]} onDOFs - DOFs to use for the transition.
 *
 * @return {Motion}
 * @override
 */
AccelerationTransitionBuilder.prototype.generateTransition = function (fromPose, toMotion, timeOffsetInTo, onDOFs) {
    var dofName, valueFrom, velocityFrom, valueTo, di;
    var tickInterval = 1 / 30;
    //check validity
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        if (!this.robotInfo.getDOFInfo(dofName)) {
            throw new Error("Error transitioning, no dofInfo found for " + dofName);
        }
        var fromVar = fromPose.get(dofName, 0);
        if (fromVar == null || (Array.isArray(fromVar) && fromVar.length < 1)) {
            throw new Error("Error transitioning, no FROM value for " + dofName);
        }
    }
    //TODO: enable MotionValidator via DEBUG flag
    //MotionValidator.valuesExist(toMotion, onDOFs);
    var interpolatorSet = this.robotInfo.getKinematicInfo().getInterpolatorSet();
    var transition = new Motion("Transition:" + toMotion.getName());
    var duration = 0;
    var toPoseInMotion = toMotion.getPoseAtTime(timeOffsetInTo, interpolatorSet);
    var toPose = fromPose.getCopy();
    //toPose will be fromPose for all unaffected joints, and will get the position
    //from toMotion for affected joints.
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        //We only copy position, as velocity will be assumed zero below
        toPose.set(dofName, toPoseInMotion.get(dofName, 0), 0);
    }
    var dga = this.robotInfo.getKinematicInfo().getDOFGlobalAlignment();
    dga.refineToGloballyClosestTargetPose(fromPose, toPose, onDOFs);
    //var slowestJoint;
    //var slowestJointDistance;
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        if (this.robotInfo.getDOFInfo(dofName).isMetric()) {
            valueFrom = fromPose.get(dofName, 0);
            velocityFrom = fromPose.get(dofName, 1);
            if (velocityFrom === null) {
                velocityFrom = 0;
            }
            valueTo = toPose.get(dofName, 0);
            var accel = this.defaultMaxAccel;
            if (this.maxAccelByDOF[dofName]) {
                //this dof has a custom acceleration selected
                accel = this.maxAccelByDOF[dofName];
            }
            //we are going to go to the animation with target velocity zero at arrival.  if non-zero velocity entertained,
            //make sure to account for it above when setting up toPose (which currently has arbitrary velocities)
            var myTime = this.planner.computeWithFixedAccel(velocityFrom, 0, valueTo - valueFrom, accel)._totalTime;
            if (myTime > duration) {
                duration = myTime;
                //slowestJoint = dofName;
                //slowestJointDistance = Math.abs(valueTo - valueFrom);
            }
        }
    }
    //console.log("AccelerationTransitionBuilder: DOF:"+slowestJoint+" drove a transition time of "+duration+" for distance "+slowestJointDistance);
    if (this.minTransitionTime && this.minTransitionTime > duration) {
        duration = this.minTransitionTime;
    }
    /** @type {Object<string,AccelPlan>} */
    var accelPlans = {};
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        if (this.robotInfo.getDOFInfo(dofName).isMetric()) {
            valueFrom = fromPose.get(dofName, 0);
            velocityFrom = fromPose.get(dofName, 1);
            if (velocityFrom === null) {
                velocityFrom = 0;
            }
            valueTo = toPose.get(dofName, 0);
            if (duration > 0.0000000001) {
                accelPlans[dofName] = this.planner.computeWithFixedTime(velocityFrom, 0, valueTo - valueFrom, duration);
            }
            else {
                accelPlans[dofName] = null;
            }
        }
    }
    var preferValue;
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        valueFrom = fromPose.get(dofName, 0);
        valueTo = toPose.get(dofName, 0);
        var dataNew = new TimestampedBuffer();
        var plan = accelPlans[dofName];
        if (plan) {
            dataNew.append(0, valueFrom);
            var t = tickInterval;
            while (t < duration) {
                var planSample = valueFrom + plan.displacementAtTime(t);
                dataNew.append(t, planSample);
                t = t + tickInterval;
            }
            dataNew.append(duration, valueTo);
        }
        else if ((preferValue = this.preferValueByDOF[dofName]) !== undefined) {
            if (preferValue === valueFrom || preferValue === valueTo) {
                //use preferValue for both from/to
                dataNew.append(0, preferValue);
                dataNew.append(duration, preferValue);
            }
            else {
                //use original values
                dataNew.append(0, valueFrom);
                dataNew.append(duration, valueTo);
            }
        }
        else {
            //we'll just trust the interpolator if we have no accel plan and no preferred value
            dataNew.append(0, valueFrom);
            dataNew.append(duration, valueTo);
        }
        transition.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return transition;
};
/**
 * Clones this builder.
 * @method jibo.animate.AccelerationTransitionBuilder#clone
 * @return {jibo.animate.AccelerationTransitionBuilder}
 * @override
 */
AccelerationTransitionBuilder.prototype.clone = function () {
    var t = new AccelerationTransitionBuilder(this.robotInfo, this.defaultMaxVelocity, this.defaultMaxAccel);
    t.minTransitionTime = this.minTransitionTime;
    var i;
    var dofs = Object.keys(this.maxVelocityByDOF);
    for (i = 0; i < dofs.length; i++) {
        t.maxVelocityByDOF[dofs[i]] = this.maxVelocityByDOF[dofs[i]];
    }
    dofs = Object.keys(this.maxAccelByDOF);
    for (i = 0; i < dofs.length; i++) {
        t.maxAccelByDOF[dofs[i]] = this.maxAccelByDOF[dofs[i]];
    }
    dofs = Object.keys(this.preferValueByDOF);
    for (i = 0; i < dofs.length; i++) {
        t.preferValueByDOF[dofs[i]] = this.preferValueByDOF[dofs[i]];
    }
    return t;
};
module.exports = AccelerationTransitionBuilder;

},{"../ifr-motion/base/AccelPlanner":67,"../ifr-motion/base/Motion":74,"../ifr-motion/base/MotionTrack":77,"../ifr-motion/base/TimestampedBuffer":81,"./TransitionBuilder":5}],2:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var AnimationLoader = require("../ifr-motion/loaders/AnimationLoader");
var Motion = require("../ifr-motion/base/Motion");
var AnnotatedMotion = require("../ifr-motion/base/AnnotatedMotion");
var Pose = require("../ifr-motion/base/Pose");
var RelativeTimeClip = require("../ifr-motion/base/RelativeTimeClip");
var MotionEventIterator = require("../ifr-motion/base/MotionEventIterator");
var LinearTransitionBuilder = require("./LinearTransitionBuilderImpl");
var AccelerationTransitionBuilder = require("./AccelerationTransitionBuilder");
var SingleLookatBuilder = require("./SingleLookatBuilder");
var PoseMotionGenerator = require("./timeline/PoseMotionGenerator");
var SimpleMotionGenerator = require("./timeline/SimpleMotionGenerator");
var LoopedMotionGenerator = require("./timeline/LoopedMotionGenerator");
var VariableSpeedMotionGenerator = require("./timeline/VariableSpeedMotionGenerator");
var LookatBlendGenerator = require("./timeline/LookatBlendGenerator");
var slog = require("../ifr-core/SLog");
var RendererOutput = require("../animation-visualize/RendererOutput");
var DOFSet = require("../geometry-info/DOFSet");
var THREE = require("@jibo/three");
var TimelineEventDispatcher = require("./timeline/TimelineEventDispatcher");
var KinematicFeaturesReporter = require("../ifr-motion/lookat/KinematicFeaturesReporter");
var PlaneDisplacementLookatDOF = require("../ifr-motion/lookat/PlaneDisplacementLookatDOF");
/**
 * @type {Object.<string, AnimationLoadResult>}
 * @private
 */
var animationCache = {};
var animationLoader = new AnimationLoader();
/**
 * @method jibo.animate#createAnimationBuilder
 * @param {AnimationUtilities} animationUtilities - The associated animation utilities.
 * @param {string} uri - Location of animation file to load.
 * @param {AnimationBuilderCreatedCallback} cb - Callback; receives newly-created AnimationBuilder instance or null if creation/load failed.
 * @param {boolean} forceReload - If true, reloads from disk, even if cached (new value will be cached). Defaults to false.
 * @param {string} [layer] - Optional; layer to play to.
 * @param {AnimationBuilder~AnimationEventCallback} [globalAnimationDelegate]
 * @private
 */
var createAnimationBuilder = function (animationUtilities, uri, cb, forceReload, layer, globalAnimationDelegate) {
    var self = animationUtilities;
    animate.trajectory.getAnimation(uri, function (motion) {
        var builder = null;
        if (motion) {
            builder = new AnimationBuilder(self, self.timeline, motion, (self.defaultTransition === null) ? null : self.defaultTransition.clone(), self.robotInfo, layer, globalAnimationDelegate);
        }
        if (cb) {
            cb(builder);
        }
    }, forceReload);
};
/**
 * @description
 * Animation APIs
 *
 * All units of measure in SI (meters).
 *
 * ```
 * var animate = require("jibo").animate;
 * ```
 *
 * Loading and playback of scripted animations:
 * ```
 * var animPath = "some/path/dance.keys";  // path to animation file
 * var basePath = "some/path";             // base path for texture resolution
 *
 * animate.createAnimationBuilderFromKeysPath(animPath, basePath, (builder) => {
 *     // add listener
 *     builder.on(animate.AnimationEventType.STOPPED, (eventType, instance, payload) => {
 *         console.log("Animation stopped; was interrupted = " + payload.interrupted);
 *     });
 *
 *     // trigger an instance of the animation
 *     builder.play();
 * });
 *
 * ```
 *
 * Procedural lookat/orient behaviors:
 * ```
 * var target = new animate.THREE.Vector3(1.0, 0.0, 1.0);  // target position to look at
 *
 * var builder = animate.createLookatBuilder();
 * builder.startLookat(target);
 *
 * ```
 *
 * Utility methods, for example:
 * ```
 * animate.blink();  // blink the eye!
 * animate.setLEDColor([0.0, 0.0, 1.0]);  // set the LED color to blue
 * ```
 *
 * @namespace jibo.animate
 */
var AnimationUtilities = function () {
};
/**
 * @method jibo.animate#init
 * @private
 * @param {MotionTimeline} timeline
 * @param {RobotInfo} robotInfo
 */
AnimationUtilities.prototype.init = function (timeline, robotInfo) {
    var self = this;
    /** @type {MotionTimeline} */
    /** @private */
    this.timeline = timeline;
    /** @type {RobotInfo} */
    /** @private */
    this.robotInfo = robotInfo;
    /** @type {TransitionBuilder} */
    /** @private */
    this.defaultTransition = this.createAccelerationTransitionBuilder(3, 5);
    //setup default defaultTransition to be fast on eye dofs, medium on body dofs, fast on LED
    this.defaultTransition.setLimits(robotInfo.getBodyDOFNames(), 3, 5);
    this.defaultTransition.setLimits(robotInfo.getEyeDOFNames(), 20, 40);
    this.defaultTransition.setLimits(robotInfo.getDOFSet("EYE_COLOR").plus("OVERLAY_COLOR").plus("SCREEN_BG_COLOR").getDOFs(), 10000, 10000);
    this.defaultTransition.setLimits(robotInfo.getDOFSet("LED").getDOFs(), 10, 20);
    this.defaultTransition.setPreferValue(robotInfo.getDOFSet("EYE_VISIBILITY").plus("OVERLAY_VISIBILITY").getDOFs(), 0);
    /** @type {AnimationBuilder~AnimationEventCallback[]} */
    /** @private */
    this.globalAnimationListeners = [];
    /** @type {LookatBuilder~LookatEventCallback[]} */
    /** @private */
    this.globalLookatListeners = [];
    /** @type {AnimationBuilder~AnimationEventCallback} */
    /** @private */
    this.globalAnimationDelegate = function (eventType, instance, payload) {
        for (var i = 0; i < self.globalAnimationListeners.length; i++) {
            self.globalAnimationListeners[i](eventType, instance, payload);
        }
    };
    /** @type {LookatBuilder~LookatEventCallback} */
    /** @private */
    this.globalLookatDelegate = function (eventType, instance, payload) {
        for (var i = 0; i < self.globalLookatListeners.length; i++) {
            self.globalLookatListeners[i](eventType, instance, payload);
        }
    };
    this.blinkBuilder = null;
    this.blinkInProgress = false;
    createAnimationBuilder(this, robotInfo.getConfig().getRobotURL() + "jibo_blink.anim", function (bb) {
        bb.setTransitionIn(null);
        bb.on(animate.AnimationEventType.STOPPED, function () {
            self.blinkInProgress = false;
        });
        bb.on(animate.AnimationEventType.CANCELLED, function () {
            self.blinkInProgress = false;
        });
        self.blinkBuilder = bb;
    }, false, "blink", this.globalAnimationDelegate);
    /** @type {?Time} */
    this.kinematicFeatureGenerationTime = null;
    /** @type {?Object.<string,{position: THREE.Vector3, direction: THREE.Vector3}>} */
    this.kinematicFeatureComputed = null;
    /** @type {KinematicFeaturesReporter} */
    this.kinematicFeaturesReporter = new KinematicFeaturesReporter(robotInfo.getKinematicInfo().getFullKinematicGroup(), [
        new KinematicFeaturesReporter.VectorFeatureReporter("Base", robotInfo.getKinematicInfo().getFullKinematicGroup().getModelControlGroup().getControlForDOF(SingleLookatBuilder.LookatDOFGeometryConfig["BaseLookatDOF"].DOFName).getTransformName(), new THREE.Vector3(0, 0, 0), SingleLookatBuilder.LookatDOFGeometryConfig["BaseLookatDOF"].Forward),
        new KinematicFeaturesReporter.VectorFeatureReporter("Head", SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].CentralTransformName, new THREE.Vector3(0, 0, 0), SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].Forward),
        new KinematicFeaturesReporter.PlaneDisplacementVectorReporter("Eye", new PlaneDisplacementLookatDOF(SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].LookatDOFName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].DOFName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].CentralTransformName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].Forward, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].PlaneNormal, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].InternalDistance, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].MinValue, SingleLookatBuilder.LookatDOFGeometryConfig["EyeLeftRight"].MaxValue), new PlaneDisplacementLookatDOF(SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].LookatDOFName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].DOFName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].CentralTransformName, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].Forward, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].PlaneNormal, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].InternalDistance, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].MinValue, SingleLookatBuilder.LookatDOFGeometryConfig["EyeUpDown"].MaxValue))
    ]);
    /** @type {string[]} */
    /** @private */
    this.dofIndicesToNames = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames();
    /** @type {Object.<string, number>} */
    /** @private */
    this.dofNamesToIndices = robotInfo.getKinematicInfo().getDefaultPose().getDOFNamesToIndices();
    /**
     * Commonly-used DOF groups for use with [AnimationBuilder.setDOFs]{@link jibo.animate.AnimationBuilder#setDOFs}
     * or [LookatBuilder.setDOFs]{@link jibo.animate.LookatBuilder#setDOFs}.
     * @enum {jibo.animate.DOFSet}
     * @memberof jibo.animate
     */
    var dofs = {
        /**
         * Complete set of robot DOFs.
         */
        ALL: robotInfo.getDOFSet("ALL"),
        /**
         * Base motor only.
         */
        BASE: robotInfo.getDOFSet("BASE"),
        /**
         * All body motors.
         */
        BODY: robotInfo.getDOFSet("BODY"),
        /**
         * All eye DOFs (transform, color, texture, visibility).
         */
        EYE: robotInfo.getDOFSet("EYE"),
        /**
         * Light ring LED color.
         */
        LED: robotInfo.getDOFSet("LED"),
        /**
         * All overlay DOFs (transform, color, texture, visibility).
         */
        OVERLAY: robotInfo.getDOFSet("OVERLAY"),
        /**
         * All screen DOFs (eye, overlay, background).
         */
        SCREEN: robotInfo.getDOFSet("SCREEN"),
        /**
         * Eye translation + rotation.
         */
        EYE_ROOT: robotInfo.getDOFSet("EYE_ROOT"),
        /**
         * Eye scale/deformation.
         */
        EYE_DEFORM: robotInfo.getDOFSet("EYE_DEFORM"),
        /**
         * Eye color, texture, and visibility.
         */
        EYE_RENDER: robotInfo.getDOFSet("EYE_RENDER"),
        /**
         * Eye translation only.
         */
        EYE_TRANSLATE: robotInfo.getDOFSet("EYE_TRANSLATE"),
        /**
         * Eye rotation only.
         */
        EYE_ROTATE: robotInfo.getDOFSet("EYE_ROTATE"),
        /**
         * Eye color only.
         */
        EYE_COLOR: robotInfo.getDOFSet("EYE_COLOR"),
        /**
         * Eye texture only.
         */
        EYE_TEXTURE: robotInfo.getDOFSet("EYE_TEXTURE"),
        /**
         * Eye visibility only.
         */
        EYE_VISIBILITY: robotInfo.getDOFSet("EYE_VISIBILITY"),
        /**
         * Overlay translation + rotation.
         */
        OVERLAY_ROOT: robotInfo.getDOFSet("OVERLAY_ROOT"),
        /**
         * Overlay scale/deformation.
         */
        OVERLAY_DEFORM: robotInfo.getDOFSet("OVERLAY_DEFORM"),
        /**
         * Overlay color, texture, and visibility.
         */
        OVERLAY_RENDER: robotInfo.getDOFSet("OVERLAY_RENDER"),
        /**
         * Overlay translation only.
         */
        OVERLAY_TRANSLATE: robotInfo.getDOFSet("OVERLAY_TRANSLATE"),
        /**
         * Overlay rotation only.
         */
        OVERLAY_ROTATE: robotInfo.getDOFSet("OVERLAY_ROTATE"),
        /**
         * Overlay color only.
         */
        OVERLAY_COLOR: robotInfo.getDOFSet("OVERLAY_COLOR"),
        /**
         * Overlay texture only.
         */
        OVERLAY_TEXTURE: robotInfo.getDOFSet("OVERLAY_TEXTURE"),
        /**
         * Overlay visibility only.
         */
        OVERLAY_VISIBILITY: robotInfo.getDOFSet("OVERLAY_VISIBILITY"),
        /**
         * Screen background color + texture.
         */
        SCREEN_BG_RENDER: robotInfo.getDOFSet("SCREEN_BG_RENDER"),
        /**
         * Screen background color only.
         */
        SCREEN_BG_COLOR: robotInfo.getDOFSet("SCREEN_BG_COLOR"),
        /**
         * Screen background texture only.
         */
        SCREEN_BG_TEXTURE: robotInfo.getDOFSet("SCREEN_BG_TEXTURE")
    };
    this.dofs = dofs;
    /** @type {LookatBlendGenerator} */
    /** @private */
    this.lookatBlendGenerator = new LookatBlendGenerator(this, this.timeline.getClock().currentTime());
    this.timeline.add(this.lookatBlendGenerator, "lookat");
};
/**
 * Gets the robot configuration info used by the animate module,
 * including DOF names, default values, and other geometric info.
 * @method jibo.animate#getRobotInfo
 * @return {jibo.animate.RobotInfo}
 */
AnimationUtilities.prototype.getRobotInfo = function () {
    return this.robotInfo;
};
/**
 * Gets the high-precision clock used by the animate module.
 * @method jibo.animate#getClock
 * @return {jibo.animate.Clock}
 */
AnimationUtilities.prototype.getClock = function () {
    return this.timeline.getClock();
};
/**
 * @callback jibo.animate~AnimationBuilderCreatedCallback
 * @param {jibo.animate.AnimationBuilder} animationBuilder - The AnimationBuilder or null on failure
 */
/**
 * Creates an animation builder from a .anim file at the specified uri. The animation will be loaded first if
 * necessary. This builder can be used for configuring animation parameters and inserting
 * an instance into the timeline.
 * @method jibo.animate#createAnimationBuilder
 * @param {string} uri - Path to the .anim file.
 * @param {jibo.animate~AnimationBuilderCreatedCallback} cb - Callback; receives newly-created [AnimationBuilder]{@link jibo.animate.AnimationBuilder}, or null if creation/load failed.
 * @param {?boolean} [forceReload] - If true, reloads from disk even if cached (new value will be cached). Defaults to false.
 */
AnimationUtilities.prototype.createAnimationBuilder = function (uri, cb, forceReload) {
    createAnimationBuilder(this, uri, cb, forceReload, "default", this.globalAnimationDelegate);
};
/**
 * Creates an animation builder from a pre-loaded (or pre-assembled) animation data structure.
 * This builder can be used for configuring animation parameters and inserting
 * an instance into the timeline.
 * The animation data object must match the structure specified for on-disk (.anim) animation files.
 * @method jibo.animate#createAnimationBuilderFromData
 * @param {Object} animationData - The animation data object.
 * @param {string} [parentDirectoryURI] - Optional; if present, texture paths will be resolved relative to the specified directory.
 * @param {string} [cacheKey] - Optional; if present, results will be cached using the specified key.
 * @return {jibo.animate.AnimationBuilder} The newly-created AnimationBuilder instance, or null if creation failed.
 */
AnimationUtilities.prototype.createAnimationBuilderFromData = function (animationData, parentDirectoryURI, cacheKey) {
    var motion = animate.trajectory.parseAnimation(animationData, parentDirectoryURI, cacheKey);
    if (motion) {
        return new AnimationBuilder(this, this.timeline, motion, (this.defaultTransition === null) ? null : this.defaultTransition.clone(), this.robotInfo, "default", this.globalAnimationDelegate);
    }
    else {
        return null;
    }
};
/**
 * Creates an animation builder from a static pose.
 * @private
 * @param {string} name - The name for the animation.
 * @param {Object.<string, Object>|Pose} pose - The static DOF values to use for the animation.
 * @param {jibo.animate.DOFSet|string[]} [dofs] - The set of DOFs to use in the animation.  Defaults to all DOFs in the pose.
 * @return {jibo.animate.AnimationBuilder} The newly-created AnimationBuilder instance, or null if creation failed.
 */
AnimationUtilities.prototype.createAnimationBuilderFromPose = function (name, pose, dofs) {
    var dofNames = null;
    if (dofs !== undefined && dofs !== null) {
        if (dofs instanceof DOFSet) {
            dofNames = dofs.getDOFs();
        }
        else {
            dofNames = dofs;
        }
    }
    var duration = 1 / 30;
    var motion;
    if (pose instanceof Pose) {
        motion = Motion.createFromPose(name, pose, duration, dofNames);
    }
    else {
        motion = Motion.createFromDOFValues(name, pose, duration, dofNames);
    }
    return new AnimationBuilder(this, this.timeline, new AnnotatedMotion(motion), this.defaultTransition.clone(), this.robotInfo, "default", this.globalAnimationDelegate);
};
var BlinkDelegate = function (animationUtilities) {
    this._bFunc = animationUtilities.blink.bind(animationUtilities);
};
BlinkDelegate.prototype.blink = function (interrupt, speed) {
    TimelineEventDispatcher.queueEvent(this._bFunc, [interrupt, speed]);
};
/**
 * Creates a builder for initiating lookat actions. This builder can be used for configuring a lookat
 * behaviors and inserting an instance of that lookat into the timeline.
 * @method jibo.animate#createLookatBuilder
 * @return {jibo.animate.LookatBuilder}
 */
AnimationUtilities.prototype.createLookatBuilder = function () {
    return new SingleLookatBuilder(this, this.timeline, this.robotInfo, (this.defaultTransition === null) ? null : this.defaultTransition.clone(), this.globalLookatDelegate, new BlinkDelegate(this));
};
/**
 * Animates Jibo's eye to blink once.
 * @method jibo.animate#blink
 * @param [interrupt] {boolean} Set to true to interrupt an ongoing blink. Set to false (default) to ignore blink calls during an ongoing blink.
 * @param [speed] {number} blink speed, defaults to 1
 */
AnimationUtilities.prototype.blink = function (interrupt, speed) {
    if (this.blinkBuilder != null) {
        if (this.blinkInProgress === false || interrupt === true) {
            if (speed === null || speed === undefined) {
                speed = 1;
            }
            if (this.blinkBuilder.clip.getSpeed() !== speed) {
                this.blinkBuilder.setSpeed(speed);
            }
            this.blinkBuilder.play();
            this.blinkInProgress = true;
        }
    }
    else {
        slog.warn("Blink requested but blink builder not yet loaded");
    }
};
/**
 * Stop all degrees of freedom motion on time-line
 * @method jibo.animate#stopAll
 * @private
 */
AnimationUtilities.prototype.stopAll = function () {
    //TODO
};
/**
 * Convenience call that sets opacity of eye and overlay to 0% or 100%.
 * @method jibo.animate#setEyeVisible
 * @param {boolean} visible Set to true to make the eye visible (default). Set to false to make the eye invisible.
 */
AnimationUtilities.prototype.setEyeVisible = function (visible) {
    var eyeVisibilityDOF = this.robotInfo.getDOFSet("EYE_VISIBILITY").getDOFs()[0];
    var overlayVisibilityDOF = this.robotInfo.getDOFSet("OVERLAY_VISIBILITY").getDOFs()[0];
    var opaqueVal = 1.0;
    var clearVal = 0.0;
    var eyePose = new Pose("eye visibility pose", [eyeVisibilityDOF, overlayVisibilityDOF]);
    eyePose.set(eyeVisibilityDOF, (visible ? opaqueVal : clearVal), 0);
    eyePose.set(overlayVisibilityDOF, (visible ? opaqueVal : clearVal), 0);
    var startTime = this.timeline.getClock().currentTime();
    this.timeline.add(new PoseMotionGenerator(this, "eye visibility motion", startTime, eyePose, 0.5), "default");
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", null, { dofs: eyePose.getDOFNames(), layer: "default", instant: "setEyeVisible instant" });
    }
};
/**
 * Convenience call that scales Jibo's eye to provided value, preserving proportions.
 * @method jibo.animate#setEyeScale
 * @param {number} scale Number to scale Jibo's eye size by.
 */
AnimationUtilities.prototype.setEyeScale = function (scale) {
    var eyeDeformers = this.robotInfo.getDOFSet("EYE_DEFORM").plus("OVERLAY_DEFORM").getDOFs();
    var defaultPose = this.robotInfo.getKinematicInfo().getDefaultPose();
    var eyePose = new Pose("eye pose", eyeDeformers);
    for (var i = 0; i < eyeDeformers.length; i++) {
        eyePose.set(eyeDeformers[i], defaultPose.get(eyeDeformers[i], 0) * scale, 0);
    }
    var startTime = this.timeline.getClock().currentTime();
    this.timeline.add(new PoseMotionGenerator(this, "eye scale motion", startTime, eyePose, 0.5), "default");
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", null, { dofs: eyePose.getDOFNames(), layer: "default", instant: "setEyeScale instant" });
    }
};
/**
 * Convenience call that scales Jibo's eye by the specified x and y scale components.
 * @param {number} xScale - Desired x-axis scale.
 * @param {number} yScale - Desired y-axis scale.
 * @method jibo.animate#setEyeScaleXY
 */
AnimationUtilities.prototype.setEyeScaleXY = function (xScale, yScale) {
    var eyeDeformers = this.robotInfo.getDOFSet("EYE_DEFORM").plus("OVERLAY_DEFORM").getDOFs();
    var defaultPose = this.robotInfo.getKinematicInfo().getDefaultPose();
    var eyePose = new Pose("eye pose", eyeDeformers);
    for (var i = 0; i < eyeDeformers.length; i++) {
        if (eyeDeformers[i].indexOf("_t_2") > -1) {
            eyePose.set(eyeDeformers[i], defaultPose.get(eyeDeformers[i], 0) * yScale, 0);
        }
        else {
            eyePose.set(eyeDeformers[i], defaultPose.get(eyeDeformers[i], 0) * xScale, 0);
        }
    }
    var startTime = this.timeline.getClock().currentTime();
    this.timeline.add(new PoseMotionGenerator(this, "eye scale motion", startTime, eyePose, 0.5), "default");
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", null, { dofs: eyePose.getDOFNames(), layer: "default", instant: "setEyeScaleXY instant" });
    }
};
/**
 * Convenience call that sets eye position to given x, y.
 * @param {number} x Desired x position of the eye in meters.
 * @param {number} y Desired y position of the eye in meters.
 * @method jibo.animate#setEyePosition
 */
AnimationUtilities.prototype.setEyePosition = function (x, y) {
    var eyeXYDOFs = this.robotInfo.getDOFSet("EYE_TRANSLATE").getDOFs();
    var overlayXYDOFs = this.robotInfo.getDOFSet("OVERLAY_TRANSLATE").getDOFs();
    var eyePose = new Pose("eye pose", eyeXYDOFs.concat(overlayXYDOFs));
    eyePose.set(eyeXYDOFs[0], x, 0);
    eyePose.set(eyeXYDOFs[1], y, 0);
    eyePose.set(overlayXYDOFs[0], x, 0);
    eyePose.set(overlayXYDOFs[1], y, 0);
    var startTime = this.timeline.getClock().currentTime();
    this.timeline.add(new PoseMotionGenerator(this, "eye position motion", startTime, eyePose, 0.5), "default");
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", null, { dofs: eyePose.getDOFNames(), layer: "default", instant: "setEyePosition instant" });
    }
};
/**
 * Convenience call that sets the LED light ring color.  Pass in either
 * a THREE.Color, or an array of three numbers (r,g,b) from 0 to 1.
 * @method jibo.animate#setLEDColor
 * @param {THREE.Color|number[]} color Color to set the LED light ring to.
 */
AnimationUtilities.prototype.setLEDColor = function (color) {
    /** @type {number[]} */
    var rgbValues = null;
    if (Array.isArray(color)) {
        rgbValues = color;
    }
    else {
        rgbValues = color.toArray();
    }
    var dofNames = this.robotInfo.getDOFSet("LED").getDOFs();
    var colorPose = new Pose("LED pose", dofNames);
    for (var i = 0; i < 3; i++) {
        colorPose.set(dofNames[i], rgbValues[i], 0);
    }
    var startTime = this.timeline.getClock().currentTime();
    this.timeline.add(new PoseMotionGenerator(this, "LED motion", startTime, colorPose, 0.5), "default");
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", null, { dofs: colorPose.getDOFNames(), layer: "default", instant: "setLEDColor instant" });
    }
};
/**
 * Restores the robot to its default pose, respecting current base orientation.
 *
 * Optional arguments allow specification of which DOFs to include in the centering behavior and
 * whether the centering behavior should restore the robot to its global "home" orientation. By default, the
 * centering behavior will include all DOFs and will preserve the robot's current local orientation.
 * @method jibo.animate#centerRobot
 * @param {jibo.animate.DOFSet} [whichDOFs] - Set of DOFs to restore to default position. Defaults to all DOFs.
 * @param {boolean} [centerGlobally=false] - If `true`, also restores the robot to its global "home" orientation.
 * @param {Function} [completionCallback] - Called when centering behavior completes or is interrupted.
 * @deprecated since 7.0.0
 * @see {@link jibo.dofarbiter#centerRobot}
 */
AnimationUtilities.prototype.centerRobot = function (whichDOFs, centerGlobally, completionCallback) {
    console.warn("Deprecation Warning: jibo.animate.centerRobot is deprecated, please use jibo.dofArbiter.centerRobot instead.");
    if (whichDOFs === undefined || whichDOFs === null)
        whichDOFs = this.dofs.ALL;
    if (centerGlobally === undefined || centerGlobally === null)
        centerGlobally = false;
    var centerMotion = Motion.createFromPose("center motion", this.robotInfo.getKinematicInfo().getDefaultPose(), 1 / 30, whichDOFs.getDOFs());
    var animBuilder = new AnimationBuilder(this, this.timeline, new AnnotatedMotion(centerMotion), this.defaultTransition.clone(), this.robotInfo, "default", this.globalAnimationDelegate);
    var builderCount = 1;
    var resetBase = centerGlobally && whichDOFs.hasDOF(this.dofs.BASE.getDOFs()[0]);
    var lookatBuilder = null;
    if (resetBase) {
        lookatBuilder = this.createLookatBuilder();
        lookatBuilder.setDOFs(this.dofs.BASE);
        builderCount++;
    }
    if (completionCallback) {
        var builderFinished = function () {
            builderCount--;
            if (builderCount === 0) {
                completionCallback();
            }
        };
        animBuilder.on(animate.AnimationEventType.CANCELLED, builderFinished);
        animBuilder.on(animate.AnimationEventType.STOPPED, builderFinished);
        if (lookatBuilder) {
            lookatBuilder.on(animate.LookatEventType.CANCELLED, builderFinished);
            lookatBuilder.on(animate.LookatEventType.STOPPED, builderFinished);
        }
    }
    animBuilder.play();
    if (lookatBuilder) {
        lookatBuilder.startLookat(new THREE.Vector3(1.0, 0.0, 0.0));
    }
};
/**
 * Get the world coordinates of important kinematic features on the robot (based on the most recent desired
 * robot position).
 * @method jibo.animate#getKinematicFeatures
 * @return {Object.<string,{position: THREE.Vector3, direction: THREE.Vector3}>}
 */
AnimationUtilities.prototype.getKinematicFeatures = function () {
    var state = this.timeline.getCurrentState();
    if (this.kinematicFeatureGenerationTime === null || state.getTime().isGreater(this.kinematicFeatureGenerationTime)) {
        this.kinematicFeatureGenerationTime = state.getTime();
        this.kinematicFeatureComputed = this.kinematicFeaturesReporter.computeFeatures(state.getPose());
    }
    return this.kinematicFeatureComputed;
};
/**
 * Sets the TransitionBuilder that the animate module will use by default to generate procedural transitions
 * between animations or static poses that require intermediate motion.
 * @method jibo.animate#setDefaultTransition
 * @param {jibo.animate.TransitionBuilder} transition - The TransitionBuilder to use as the new default.
 * @private
 */
AnimationUtilities.prototype.setDefaultTransition = function (transition) {
    this.defaultTransition = transition;
};
/**
 * Gets the default TransitionBuilder used by the animate module for procedural transitions.
 * @method jibo.animate#getDefaultTransition
 * @return {jibo.animate.TransitionBuilder}
 */
AnimationUtilities.prototype.getDefaultTransition = function () {
    return this.defaultTransition;
};
/**
 * Creates a new transition builder that uses simple linear blending to generate transition motions.
 * @method jibo.animate#createLinearTransitionBuilder
 * @return {jibo.animate.LinearTransitionBuilder} A new, configurable linear transition builder.
 */
AnimationUtilities.prototype.createLinearTransitionBuilder = function () {
    return animate.trajectory.createLinearTransitionBuilder(this.robotInfo);
};
/**
 * Creates a new transition builder that can generate transition motions using
 * configurable acceleration and velocity limits.
 * @method jibo.animate#createAccelerationTransitionBuilder
 * @param {number} defaultMaxVelocity - Max velocity to use by default.
 * @param {number} defaultMaxAcceleration - Max acceleration to use by default.
 * @return {jibo.animate.AccelerationTransitionBuilder} A new, configurable acceleration transition builder.
 */
AnimationUtilities.prototype.createAccelerationTransitionBuilder = function (defaultMaxVelocity, defaultMaxAcceleration) {
    return animate.trajectory.createAccelerationTransitionBuilder(this.robotInfo, defaultMaxVelocity, defaultMaxAcceleration);
};
/**
 * Gets all RobotRenderers associated with the provided timeline.
 * @method jibo.animate#getRenderers
 * @param {MotionTimeline} timeline
 * @return {jibo.visualize.RobotRenderer[]} renderers
 * @private
 */
function getRenderers(timeline) {
    /** @type {RobotRenderer[]} */
    var renderers = [];
    var outputs = timeline.getOutputs();
    for (var i = 0; i < outputs.length; i++) {
        if (outputs[i] instanceof RendererOutput) {
            renderers = renderers.concat(outputs[i].getRenderers());
        }
    }
    return renderers;
}
/**
 * Installs this render plugin. If a plugin with the same name is already installed, that
 * plugin will be uninstalled first.
 * @method jibo.animate#installRenderPlugin
 * @param {jibo.visualize.RenderPlugin} renderPlugin - Plugin to install.
 */
AnimationUtilities.prototype.installRenderPlugin = function (renderPlugin) {
    /** @type {RobotRenderer[]} */
    var renderers = getRenderers(this.timeline);
    for (var i = 0; i < renderers.length; i++) {
        renderers[i].installRenderPlugin(renderPlugin);
    }
};
/**
 * Removes named RenderPlugin. [uninstall()]{@link jibo.visualize.RenderPlugin#uninstall} will be called on the plugin.
 * @method jibo.animate#removeRenderPlugin
 * @param {string} renderPluginName RenderPlugin to remove.
 */
AnimationUtilities.prototype.removeRenderPlugin = function (renderPluginName) {
    /** @type {RobotRenderer[]} */
    var renderers = getRenderers(this.timeline);
    for (var i = 0; i < renderers.length; i++) {
        renderers[i].removeRenderPlugin(renderPluginName);
    }
};
/**
 * Gets the names of all installed RenderPlugins.
 * @method jibo.animate#getInstalledRenderPluginNames
 * @returns {string[]}
 */
AnimationUtilities.prototype.getInstalledRenderPluginNames = function () {
    /** @type {string[]} */
    var pluginNames = [];
    /** @type {RobotRenderer[]} */
    var renderers = getRenderers(this.timeline);
    for (var i = 0; i < renderers.length; i++) {
        var partialNames = renderers[i].getInstalledRenderPluginNames();
        for (var j = 0; j < partialNames.length; j++) {
            //don't duplicate names
            if (pluginNames.indexOf(partialNames[j]) < 0) {
                pluginNames.push(partialNames[j]);
            }
        }
    }
    return pluginNames;
};
/**
 * Adds a global animation event listener.
 * @param {AnimationBuilder~AnimationEventCallback} listener
 * @method jibo.animate#addGlobalAnimationListener
 * @private
 */
AnimationUtilities.prototype.addGlobalAnimationListener = function (listener) {
    if (this.globalAnimationListeners.indexOf(listener) === -1) {
        this.globalAnimationListeners.push(listener);
    }
};
/**
 * Removes a global animation event listener.
 * @method jibo.animate#removeGlobalAnimationListener
 * @param {AnimationBuilder~AnimationEventCallback} listener
 * @private
 */
AnimationUtilities.prototype.removeGlobalAnimationListener = function (listener) {
    var index = this.globalAnimationListeners.indexOf(listener);
    if (index !== -1) {
        this.globalAnimationListeners.splice(index, 1);
    }
};
/**
 * Adds a global lookat event listener.
 * @param {LookatBuilder~LookatEventCallback} listener
 * @method jibo.animate#addGlobalLookatListener
 * @private
 */
AnimationUtilities.prototype.addGlobalLookatListener = function (listener) {
    if (this.globalLookatListeners.indexOf(listener) === -1) {
        this.globalLookatListeners.push(listener);
    }
};
/**
 * Removes a global lookat event listener.
 * @param {LookatBuilder~LookatEventCallback} listener
 * @method jibo.animate#removeGlobalLookatListener
 * @private
 */
AnimationUtilities.prototype.removeGlobalLookatListener = function (listener) {
    var index = this.globalLookatListeners.indexOf(listener);
    if (index !== -1) {
        this.globalLookatListeners.splice(index, 1);
    }
};
/**
 * Protected constructor for internal use only.
 *
 * An AnimationInstance is a handle for an ongoing instance of a specific, configured animation.
 * AnimationInstances are returned by AnimationBuilder's [play]{@link jibo.animate.AnimationBuilder#play} method.
 *
 * @param {jibo.animate.AnimationBuilder} builder - Protected constructor parameter.
 * @param {MotionGenerator} transitionClip - Protected constructor parameter.
 * @param {VariableSpeedMotionGenerator} animationClip - Protected constructor parameter.
 * @param {string} layer - Protected constructor parameter.
 * @param {string} name - Protected constructor parameter.
 * @protected
 * @class AnimationInstance
 * @memberof jibo.animate
 */
var AnimationInstance = function (builder, transitionClip, animationClip, layer, name) {
    /** @type {AnimationBuilder} */
    /** @private */
    this.builder = builder;
    /** @type {MotionGenerator} */
    /** @private */
    this.transitionClip = transitionClip;
    /** @type {VariableSpeedMotionGenerator} */
    /** @private */
    this.animationClip = animationClip;
    /** @type {string} */
    /** @private */
    this.layer = layer;
    /** @type {string} */
    /** @private */
    this.name = name;
    /** @type {boolean} */
    /** @private */
    this.paused = false;
    /** @type {number} */
    /** @private */
    this.speedAtPause = 1;
};
/**
 * Stops this animation instance.
 * @method jibo.animate.AnimationInstance#stop
 */
AnimationInstance.prototype.stop = function () {
    var timeline = this.builder.timeline;
    /** @type {jibo.animate.Time} */
    var stopTime = timeline.getClock().currentTime();
    //if all clips are fully committed, we will not stop
    if (!this.animationClip.endsAfter(stopTime)) {
        //stopTime is after clip is already over; cannot stop.  do nothing.
        slog.warn("Ignoring stop on " + this.animationClip.getName() + " as it is already over");
        return;
    }
    //however we will not stop before any of the clips start!
    if (this.transitionClip === null) {
        //there is no transition, our first stop opportunity is at the start of the main clip
        if (this.animationClip.getStartTime().isGreater(stopTime)) {
            stopTime = this.animationClip.getStartTime();
            slog.info("Stopping called on transitionless animation " + this.animationClip.getName() + " before anim started, moving stopTime forward");
        }
    }
    else {
        if (this.transitionClip.getStartTime().isGreater(stopTime)) {
            stopTime = this.transitionClip.getStartTime();
            slog.info("Stopping called on animation " + this.animationClip.getName() + " before its transition started, moving stopTime forward");
        }
    }
    /** @type {MotionGenerator} */
    var useClip = null;
    //now find out which dofs are being used on stop time
    if (this.transitionClip !== null && this.transitionClip.endsAfter(stopTime)) {
        //we have a transition clip, and our stop time is before the end of it, so we should
        //use that clip for the stop pose
        useClip = this.transitionClip;
    }
    else {
        //we don't have a transition clip, or our stop time is after the end of it, so use anim
        useClip = this.animationClip;
    }
    /** @type {string[]} */
    var dofsToStop = [];
    /** @type {number[]} */
    var possibleDOFs = useClip.getDOFIndices();
    for (var i = 0; i < possibleDOFs.length; i++) {
        if (useClip.dofEndsAfter(possibleDOFs[i], stopTime)) {
            dofsToStop.push(this.builder.animUtils.dofIndicesToNames[possibleDOFs[i]]);
        }
    }
    //TODO: using zero-duration motion for now, might want to add explicit timeline stop() method
    /** @type {Pose} */
    var stopPose = new Pose("stop pose", dofsToStop);
    for (var d = 0; d < dofsToStop.length; d++) {
        stopPose.set(dofsToStop[d], [0]);
    }
    /** @type {Motion} */
    var stopMotion = Motion.createFromPose(useClip.getName() + "_stop", stopPose, 0);
    var stopClip = new SimpleMotionGenerator(this.builder.animUtils, stopMotion, stopTime, this.builder.robotInfo);
    timeline.add(stopClip, this.layer);
};
/**
 * Get the start time for the animation's 'in' transition, or the start time for
 * the animation itself, if no 'in' transition is specified.
 * @method jibo.animate.AnimationInstance#getTransitionStartTime
 * @return {jibo.animate.Time}
 */
AnimationInstance.prototype.getTransitionStartTime = function () {
    if (this.transitionClip) {
        return this.transitionClip.getStartTime();
    }
    else {
        return this.animationClip.getStartTime();
    }
};
/**
 * Gets the estimated start time for the animation, following its
 * 'in' transition, if applicable.
 * @method jibo.animate.AnimationInstance#getAnimationStartTime
 * @return {jibo.animate.Time}
 */
AnimationInstance.prototype.getAnimationStartTime = function () {
    return this.animationClip.getStartTime();
};
/**
 * Gets the estimated end time for the animation.
 * @method jibo.animate.AnimationInstance#getAnimationEndTime
 * @return {jibo.animate.Time}
 * @deprecated
 */
AnimationInstance.prototype.getAnimationEndTime = function () {
    console.warn("Deprecation Warning: AnimationInstance.getAnimationEndTime is deprecated, please use animation STOPPED/CANCELLED events instead.");
    console.warn(new Error().stack);
    return this.getAnimationStartTime().add(this.builder.getConfiguredAnimationDuration());
};
/**
 * Gets the AnimationBuilder that generated this instance through "play".
 * @method jibo.animate.AnimationInstance#getBuilder
 * @return {jibo.animate.AnimationBuilder}
 */
AnimationInstance.prototype.getBuilder = function () {
    return this.builder;
};
/**
 * Gets a descriptive name for this instance.
 * @method jibo.animate.AnimationInstance#getName
 * @return {string} The name for this instance.
 */
AnimationInstance.prototype.getName = function () {
    return this.name;
};
/**
 * Pauses or unpauses this animation instance.
 * @method jibo.animate.AnimationInstance#setPaused
 * @param {boolean} shouldPause - True if the animation should pause, false if it should resume.
 */
AnimationInstance.prototype.setPaused = function (shouldPause) {
    if (shouldPause && !this.paused) {
        // pause!
        this.speedAtPause = this.animationClip.getSpeed();
        this.animationClip.setSpeed(0);
        this.paused = true;
    }
    else if (!shouldPause && this.paused) {
        // unpause!
        this.animationClip.setSpeed(this.speedAtPause);
        this.paused = false;
    }
};
/**
 * Protected constructor for internal use only.
 *
 * An AnimationBuilder is used to configure parameters and register event
 * listeners for a specific chunk of animation data. Instances of the configured
 * animation can be triggered via the [play]{@link jibo.animate.AnimationBuilder#play} method.
 *
 * AnimationBuilders are typically created via the animate module's
 * [createAnimationBuilderFromKeysPath]{@link jibo.animate#createAnimationBuilderFromKeysPath} method.
 *
 * ```
 * var animate = require("jibo").animate;
 *
 * var animPath = "some/path/dance.keys";  // path to animation file
 * var basePath = "some/path";             // base path for texture resolution
 *
 * animate.createAnimationBuilderFromKeysPath(animPath, basePath, (builder) => {
 *     // add listener
 *     builder.on(animate.AnimationEventType.STOPPED, (eventType, instance, payload) => {
 *         console.log("Animation stopped; was interrupted = " + payload.interrupted);
 *     });
 *
 *     // trigger an instance of the animation
 *     builder.play();
 * });
 *
 * ```
 *
 * @param {AnimationUtilities} animUtils - Protected constructor parameter.
 * @param {MotionTimeline} timeline - Protected constructor parameter.
 * @param {AnnotatedMotion} motion - Protected constructor parameter.
 * @param {jibo.animate.TransitionBuilder} transition - Protected constructor parameter.
 * @param {jibo.animate.RobotInfo} robotInfo - Protected constructor parameter.
 * @param {string} [layer] - Protected constructor parameter.
 * @param {jibo.animate.AnimationBuilder~AnimationEventCallback} [globalAnimationDelegate] - Protected constructor parameter.
 * @class AnimationBuilder
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var AnimationBuilder = function (animUtils, timeline, motion, transition, robotInfo, layer, globalAnimationDelegate) {
    if (layer == null) {
        layer = "default";
    }
    /** @private */
    this.layer = layer;
    /** @type {AnimationUtilities} */
    /** @private */
    this.animUtils = animUtils;
    /** @type {MotionTimeline} */
    /** @private */
    this.timeline = timeline;
    /** @type {AnnotatedMotion} */
    /** @private */
    this.motion = motion;
    /** @type {string[]} */
    /** @private */
    this.dofNames = motion.getMotion().getDOFs();
    /** @type {Object<AnimationEventType,AnimationEventCallback[]>} */
    /** @private */
    this.eventHandlers = {};
    /** @type {RelativeTimeClip} */
    /** @private */
    this.clip = new RelativeTimeClip(0, motion.getMotion().getDuration(), 1);
    /** @type {number} */
    /** @private */
    this.numLoops = 1;
    /** @type {TransitionBuilder} */
    /** @private */
    this.transition = transition;
    /** @type {boolean} */
    /** @private */
    this.stopOrient = false;
    /** @type {string[]} */
    /** @private */
    this.layerDOFs = timeline.getDOFsForLayer(layer);
    /** @type {RobotInfo} */
    /** @private */
    this.robotInfo = robotInfo;
    /** @type {AnimationBuilder~AnimationEventCallback} */
    /** @private */
    this.globalAnimationDelegate = globalAnimationDelegate;
    //init to all dofs
    this.setDOFs(null);
};
/**
 * Removes all event listeners and resets this builder to default settings.
 * @method jibo.animate.AnimationBuilder#reset
 */
AnimationBuilder.prototype.reset = function () {
    this.layer = "default";
    this.layerDOFs = this.timeline.getDOFsForLayer(this.layer);
    this.dofNames = this.motion.getMotion().getDOFs();
    this.eventHandlers = {};
    this.clip = new RelativeTimeClip(0, this.motion.getMotion().getDuration(), 1);
    this.numLoops = 1;
    this.transition = this.animUtils.getDefaultTransition().clone();
    this.stopOrient = false;
    this.setDOFs(null);
};
/**
 * Gets a copy of this AnimationBuilder with all event listeners removed and reset to default settings.
 * Configuration changes made to the copy will not affect the original.
 * @method jibo.animate.AnimationBuilder#getCleanCopy
 * @return {jibo.animate.AnimationBuilder} A newly-created AnimationBuilder instance with default settings.
 */
AnimationBuilder.prototype.getCleanCopy = function () {
    var transition = this.animUtils.getDefaultTransition().clone();
    return new AnimationBuilder(this.animUtils, this.timeline, this.motion, transition, this.robotInfo, "default", this.globalAnimationDelegate);
};
//map between timeline events and animation events
AnimationBuilder.prototype._createStartedHandler = function (animationInstance) {
    var globalDelegate = this.globalAnimationDelegate;
    var h = this.eventHandlers[animate.AnimationEventType.STARTED];
    if (globalDelegate || h) {
        var startHandlers = null;
        if (h) {
            startHandlers = h.slice(0);
        }
        return function () {
            if (globalDelegate) {
                globalDelegate(animate.AnimationEventType.STARTED, animationInstance, {});
            }
            if (startHandlers) {
                for (var i = 0; i < startHandlers.length; i++) {
                    startHandlers[i](animate.AnimationEventType.STARTED, animationInstance, {});
                }
            }
        };
    }
    else {
        return null;
    }
};
//map between timeline events and animation events
AnimationBuilder.prototype._createStoppedHandler = function (animationInstance) {
    var globalDelegate = this.globalAnimationDelegate;
    var h = this.eventHandlers[animate.AnimationEventType.STOPPED];
    if (globalDelegate || h) {
        var stopHandlers = null;
        if (h) {
            stopHandlers = h.slice(0);
        }
        return function (interrupted) {
            if (globalDelegate) {
                globalDelegate(animate.AnimationEventType.STOPPED, animationInstance, { interrupted: interrupted });
            }
            if (stopHandlers) {
                for (var i = 0; i < stopHandlers.length; i++) {
                    stopHandlers[i](animate.AnimationEventType.STOPPED, animationInstance, { interrupted: interrupted });
                }
            }
        };
    }
    else {
        return null;
    }
};
//map between timeline events and animation events
AnimationBuilder.prototype._createRemovedHandler = function (animationInstance) {
    var globalDelegate = this.globalAnimationDelegate;
    var hStopped = this.eventHandlers[animate.AnimationEventType.STOPPED];
    var hCancelled = this.eventHandlers[animate.AnimationEventType.CANCELLED];
    if (globalDelegate || hStopped || hCancelled) {
        var stopHandlers = null;
        var cancelHandlers = null;
        if (hStopped) {
            stopHandlers = hStopped.slice(0);
        }
        if (hCancelled) {
            cancelHandlers = hCancelled.slice(0);
        }
        return function (started, stopped) {
            var i;
            if (globalDelegate) {
                if (started && !stopped) {
                    globalDelegate(animate.AnimationEventType.STOPPED, animationInstance, { interrupted: true });
                }
                if (!started) {
                    globalDelegate(animate.AnimationEventType.CANCELLED, animationInstance, {});
                }
            }
            if (stopHandlers) {
                if (started && !stopped) {
                    for (i = 0; i < stopHandlers.length; i++) {
                        stopHandlers[i](animate.AnimationEventType.STOPPED, animationInstance, { interrupted: true });
                    }
                }
            }
            if (cancelHandlers) {
                if (!started) {
                    for (i = 0; i < cancelHandlers.length; i++) {
                        cancelHandlers[i](animate.AnimationEventType.CANCELLED, animationInstance, {});
                    }
                }
            }
        };
    }
    else {
        return null;
    }
};
//map between timeline events and animation events
AnimationBuilder.prototype._createEventHandler = function (animationInstance) {
    var globalDelegate = this.globalAnimationDelegate;
    var eventHandlers = null;
    if (this.eventHandlers[animate.AnimationEventType.EVENT]) {
        eventHandlers = this.eventHandlers[animate.AnimationEventType.EVENT].slice(0);
    }
    /** @type {Object<string,AnimationEventCallback[]>} */
    var customHandlers = {};
    var eventKeys = Object.keys(this.eventHandlers);
    for (var k = 0; k < eventKeys.length; k++) {
        var eventKey = eventKeys[k];
        if (eventKey !== animate.AnimationEventType.STARTED && eventKey !== animate.AnimationEventType.STOPPED &&
            eventKey !== animate.AnimationEventType.CANCELLED && eventKey !== animate.AnimationEventType.EVENT) {
            if (this.eventHandlers[eventKey]) {
                customHandlers[eventKey] = this.eventHandlers[eventKey].slice(0);
            }
        }
    }
    if (globalDelegate || eventHandlers || Object.keys(customHandlers).length > 0) {
        return function (motionEvent) {
            var i;
            if (globalDelegate) {
                globalDelegate(animate.AnimationEventType.EVENT, animationInstance, { eventName: motionEvent.getEventName(), payload: motionEvent.getPayload() });
            }
            if (eventHandlers) {
                for (i = 0; i < eventHandlers.length; i++) {
                    eventHandlers[i](animate.AnimationEventType.EVENT, animationInstance, { eventName: motionEvent.getEventName(), payload: motionEvent.getPayload() });
                }
            }
            var eventName = motionEvent.getEventName();
            if (customHandlers[eventName]) {
                for (i = 0; i < customHandlers[eventName].length; i++) {
                    customHandlers[eventName][i](eventName, animationInstance, motionEvent.getPayload());
                }
            }
        };
    }
    else {
        return null;
    }
};
/**
 * Triggers an instance of the animation to start playing, using the configuration represented
 * in this AnimationBuilder.
 * @method jibo.animate.AnimationBuilder#play
 * @return {jibo.animate.AnimationInstance}
 */
AnimationBuilder.prototype.play = function () {
    var startTime = this.timeline.getClock().currentTime();
    var blendMode = null;
    if (this.layer === "default") {
        blendMode = this.stopOrient ? LookatBlendGenerator.BlendMode.RELATIVE_TO_CURRENT : LookatBlendGenerator.BlendMode.RELATIVE_TO_TARGET;
    }
    var transitionDelay = 0;
    var transitionClip = null;
    if (this.transition) {
        var transitionMotion = this.animUtils.lookatBlendGenerator.generateTransition(this.layer, this.motion.getMotion(), this.clip.getInPoint(), this.dofNames, this.transition, blendMode);
        transitionClip = new SimpleMotionGenerator(this.animUtils, transitionMotion, startTime, this.robotInfo);
        if (this.layer === "default") {
            transitionClip.setBaseBlendMode(LookatBlendGenerator.BlendMode.ABSOLUTE);
        }
        transitionClip = this.timeline.add(transitionClip, this.layer);
        if (transitionClip !== null) {
            transitionDelay = transitionMotion.getDuration();
        }
    }
    var animationInstance = new AnimationInstance(this, null, null, this.layer, this.motion.getMotion().getName());
    var animationClip = null;
    var clipData = new RelativeTimeClip(this.clip.getInPoint(), this.clip.getOutPoint(), 1);
    if (this.numLoops === 1) {
        animationClip = new SimpleMotionGenerator(this.animUtils, this.motion.getMotion(), startTime.add(transitionDelay), this.robotInfo, this.dofNames, clipData);
        animationClip.setEvents(new MotionEventIterator(this.motion.getEvents(), clipData));
        animationClip.setSourceTimeReportingEnabled(true);
    }
    else {
        var motionList = [this.motion.getMotion()];
        var clipList = [clipData];
        var motionEventsList = [new MotionEventIterator(this.motion.getEvents(), clipData)];
        var sourceTimeReportingFlags = [true];
        if (this.transition) {
            var finalPose = this.motion.getMotion().getPoseAtTime(this.clip.getOutPoint(), this.robotInfo.getKinematicInfo().getInterpolatorSet());
            var loopTransition = this.transition.generateTransition(finalPose, this.motion.getMotion(), this.clip.getInPoint(), this.dofNames);
            motionList.push(loopTransition);
            clipList.push(new RelativeTimeClip(0, loopTransition.getDuration(), 1));
            motionEventsList.push(new MotionEventIterator([], clipList[1]));
            sourceTimeReportingFlags.push(false);
        }
        animationClip = new LoopedMotionGenerator(this.animUtils, motionList, clipList, this.numLoops, startTime.add(transitionDelay), this.robotInfo, this.dofNames);
        animationClip.setEvents(motionEventsList);
        animationClip.setSourceTimeReportingEnabled(sourceTimeReportingFlags);
    }
    animationClip.setHandlers(this._createStartedHandler(animationInstance), this._createStoppedHandler(animationInstance), this._createRemovedHandler(animationInstance), this._createEventHandler(animationInstance));
    if (this.layer === "default") {
        animationClip.setBaseBlendMode(blendMode);
    }
    animationClip = new VariableSpeedMotionGenerator(this.animUtils, animationClip, this.clip.getSpeed());
    animationClip = this.timeline.add(animationClip, this.layer);
    animationInstance.transitionClip = transitionClip;
    animationInstance.animationClip = animationClip;
    if (this.globalAnimationDelegate) {
        this.globalAnimationDelegate("ADDED", animationInstance, { dofs: this.dofNames, layer: this.layer });
    }
    return animationInstance;
};
/**
 * Function signature for animation builder event listeners, for use with AnimationBuilder's [on]{@link jibo.animate.AnimationBuilder#on} method.
 * @callback jibo.animate.AnimationBuilder~AnimationEventCallback
 * @param {jibo.animate.AnimationEventType} eventName - The event type.
 * @param {jibo.animate.AnimationInstance} animationInstance - Instance that generated this event.
 * @param {Object} payload - Event-specific payload.
 */
/**
 * Registers an event listener.
 * @method jibo.animate.AnimationBuilder#on
 * @param {jibo.animate.AnimationEventType} eventName - The event type to listen for.
 * @param {jibo.animate.AnimationBuilder~AnimationEventCallback} callback - The listener function.
 */
AnimationBuilder.prototype.on = function (eventName, callback) {
    /** @type {AnimationEventCallback[]} */
    var handlersForType = this.eventHandlers[eventName];
    if (!handlersForType) {
        handlersForType = [];
        this.eventHandlers[eventName] = handlersForType;
    }
    if (handlersForType.indexOf(callback) === -1) {
        handlersForType.push(callback);
    }
};
/**
 * Un-registers an event listener.
 * @method jibo.animate.AnimationBuilder#off
 * @param {jibo.animate.AnimationEventType} eventName - The event type.
 * @param {jibo.animate.AnimationBuilder~AnimationEventCallback} callback - The listener function.
 */
AnimationBuilder.prototype.off = function (eventName, callback) {
    /** @type {AnimationEventCallback[]} */
    var handlersForType = this.eventHandlers[eventName];
    if (handlersForType) {
        var index = handlersForType.indexOf(callback);
        if (index !== -1) {
            handlersForType.splice(index, 1);
        }
    }
};
/**
 * Sets the speed of the animation.
 * @method jibo.animate.AnimationBuilder#setSpeed
 * @param {number} speed - Animation speed. 1 for normal speed, 2 for twice as fast, 0.5 for half speed, etc.
 */
AnimationBuilder.prototype.setSpeed = function (speed) {
    this.clip = new RelativeTimeClip(this.clip.getInPoint(), this.clip.getOutPoint(), speed);
};
/**
 * Sets the number of times to loop the animation before stopping.
 * Specify 0 to loop forever.
 * @method jibo.animate.AnimationBuilder#setNumLoops
 * @param {number} numLoops - Number of times to loop the animation; 0 to loop forever.
 */
AnimationBuilder.prototype.setNumLoops = function (numLoops) {
    if (numLoops < 0) {
        throw new Error("numLoops value is negative: " + numLoops);
    }
    this.numLoops = numLoops;
};
/**
 * Sets the DOFs to be used by this builder. The DOFs used are the intersection of
 * the DOFs passed as the argument here, the DOFs present in the underlying motion, and
 * the DOFs used by the layer to which this builder is bound.
 *
 * Commonly-used DOF groups are defined in [animate.dofs]{@link jibo.animate.dofs}.
 * @method jibo.animate.AnimationBuilder#setDOFs
 * @param {jibo.animate.DOFSet|string[]} dofNames - Names of DOFs to use; null to use all DOFs.
 */
AnimationBuilder.prototype.setDOFs = function (dofNames) {
    if (dofNames == null) {
        dofNames = this.motion.getMotion().getDOFs();
    }
    else if (dofNames instanceof DOFSet) {
        dofNames = dofNames.getDOFs();
    }
    this.dofNames = []; //add intersection of dofNames, dofs in this motion, and dofs in our layerDOFs
    for (var i = 0; i < dofNames.length; i++) {
        if (this.motion.getMotion().hasDOF(dofNames[i]) && //it's in the motion
            this.layerDOFs.indexOf(dofNames[i]) > -1) {
            this.dofNames.push(dofNames[i]);
        }
    }
};
/**
 * Gets the DOFs that will be used by this builder.
 * @method jibo.animate.AnimationBuilder#getDOFs
 * @return {string[]}
 */
AnimationBuilder.prototype.getDOFs = function () {
    return this.dofNames;
};
/**
 * Set sub-clip to play in animation.  Times are in original time scale (rather than altered timescale resulting from setSpeed)
 * @param {number} inPoint - play from this time in seconds instead of start of animation.  will start from beginning if null/undefined
 * @param {number} outPoint - if present, play to this time in seconds instead of end of animation.  will play to end if null/undefined
 * @method jibo.animate.AnimationBuilder#setPlayBounds
 * @private
 */
AnimationBuilder.prototype.setPlayBounds = function (inPoint, outPoint) {
    if (inPoint === null || inPoint === undefined) {
        inPoint = 0;
    }
    if (outPoint === null || outPoint === undefined) {
        outPoint = this.getSourceAnimationDuration();
    }
    this.clip = new RelativeTimeClip(inPoint, outPoint, this.clip.getSpeed());
};
/**
 * Gets the duration, in seconds, of the source animation for this builder (unaffected by settings such as speed, etc).
 * @method jibo.animate.AnimationBuilder#getSourceAnimationDuration
 * @return {number}
 */
AnimationBuilder.prototype.getSourceAnimationDuration = function () {
    return this.motion.getMotion().getDuration();
};
/**
 * Gets the duration, in seconds, of the animation that will be produced by this builder given current settings (speed, etc).
 * @method jibo.animate.AnimationBuilder#getConfiguredAnimationDuration
 * @return {number}
 */
AnimationBuilder.prototype.getConfiguredAnimationDuration = function () {
    return this.clip.getDuration();
};
/**
 * Sets the transition builder that will be used to generate a smooth
 * transition into the start of the animation.
 * @method jibo.animate.AnimationBuilder#setTransitionIn
 * @param {jibo.animate.TransitionBuilder} transition - Transition builder to use for the animation's 'in' transition.
 */
AnimationBuilder.prototype.setTransitionIn = function (transition) {
    this.transition = transition;
};
/**
 * Gets the transition builder currently specified for the animation's 'in' transition.
 * @method jibo.animate.AnimationBuilder#getTransitionIn
 * @return {jibo.animate.TransitionBuilder}
 */
AnimationBuilder.prototype.getTransitionIn = function () {
    return this.transition;
};
/**
 * Sets the animation's base-blending policy.
 *
 * This policy has an effect only if the animation is configured to control the robot's base DOF.
 * @method jibo.animate.AnimationBuilder#setStopOrient
 * @param {boolean} stopOrient If true, the animation will seize exclusive control of
 * the robot's base DOF, stopping any in-progress orient behavior on that DOF. If false, the animation
 * will blend additively with any ongoing orient/lookt behavior on the base DOF.
 */
AnimationBuilder.prototype.setStopOrient = function (stopOrient) {
    this.stopOrient = stopOrient;
};
/**
 * Sets the blending layer for the animation [warning: advanced usage only!]
 * @method jibo.animate.AnimationBuilder#setLayer
 * @param {string} layerName The name of the blending layer.
 */
AnimationBuilder.prototype.setLayer = function (layerName) {
    if (this.timeline.getDOFsForLayer(layerName) === null) {
        slog.error("AnimationBuilder: ignoring setLayer with unknown layer name: " + layerName);
    }
    else {
        this.layer = layerName;
        this.layerDOFs = this.timeline.getDOFsForLayer(layerName);
        // trim our dofs to just the ones that are present in the layer
        this.setDOFs(this.dofNames.slice(0));
    }
};
/**
 * Protected constructor for internal use only.
 *
 * A LookatInstance is a handle for an ongoing instance of a particular
 * procedural lookat/orient behavior. LookatInstances are returned by
 * LookatBuilder's [startLookat]{@link jibo.animate.LookatBuilder#startLookat} method.
 *
 * @class LookatInstance
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var LookatInstance = {};
/** @private */
LookatInstance.prototype = {
    /* interface definition:        */
    /* eslint-disable no-unused-vars */
    /**
     * Stops this lookat behavior.
     */
    stop: function () { },
    /**
     * Modifies the target of this lookat behavior. The behavior will be
     * redirected toward the specified target position, unless the behavior has
     * already been stopped or interrupted.
     * @method jibo.animate.LookatInstance#updateTarget
     * @param {THREE.Vector3|number[]} target - The target position (in world-space) towards which the behavior will be redirected.
     */
    updateTarget: function (target) { },
    /**
     * Gets the current target of the lookat behavior.
     * @method jibo.animate.LookatInstance#getTarget
     * @return {THREE.Vector3} current target
     */
    getTarget: function () { },
    /**
     * Gets the LookatBuilder that generated this instance through "startLookat".
     * @method jibo.animate.LookatInstance#getBuilder
     * @return {jibo.animate.LookatBuilder}
     */
    getBuilder: function () { },
    /**
     * Gets a descriptive name for this instance.
     * @method jibo.animate.LookatInstance#getName
     * @return {string}
     */
    getName: function () { }
    /* end interface definition:        */
    /* eslint-enable no-unused-vars */
};
/**
 * Protected constructor for internal use only.
 *
 * A LookatBuilder is used to configure parameters and register event
 * listeners for a procedural lookat/orient behavior.  Instances of the configured
 * behavior can be triggered via the [startLookat]{@link jibo.animate.LookatBuilder#startLookat} method.
 *
 * LookatBuilders are created via the animate module's
 * [createLookatBuilder]{@link jibo.animate#createLookatBuilder} method.
 *
 * ```
 * var animate = require("jibo").animate;
 *
 * var target = new animate.THREE.Vector3(1.0, 0.0, 1.0);  // target position to look at
 *
 * var builder = animate.createLookatBuilder();
 * builder.startLookat(target);
 *
 * ```
 *
 * @class LookatBuilder
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var LookatBuilder = {};
/**
 * @private
 */
LookatBuilder.prototype = {
    /* interface definition:        */
    /* eslint-disable no-unused-vars */
    /**
     * Triggers an instance of a lookat/orient behavior, using the configuration represented
     * in this LookatBuilder. The behavior will be directed toward the specified initial target position.
     * @method jibo.animate.LookatBuilder#startLookat
     * @param {THREE.Vector3|number[]} target - The target position (in world-space) towards which the behavior will be directed.
     * @return {jibo.animate.LookatInstance}
     */
    startLookat: function (target) {
    },
    /**
     * Function signature for lookat builder event listeners, for use with LookatBuilder's [on]{@link jibo.animate.LookatBuilder#on} method.
     * @callback jibo.animate.LookatBuilder~LookatEventCallback
     * @param {jibo.animate.LookatEventType} eventName - The event type.
     * @param {jibo.animate.LookatInstance} lookatInstance - Lookat instance that generated this event.
     */
    /**
     * Registers an event listener.
     * @method jibo.animate.LookatBuilder#on
     * @param {jibo.animate.LookatEventType} eventName - The event type to listen for.
     * @param {jibo.animate.LookatBuilder~LookatEventCallback} callback - The listener function.
     */
    on: function (eventName, callback) {
    },
    /**
     * Un-registers an event listener.
     * @method jibo.animate.LookatBuilder#off
     * @param {jibo.animate.LookatEventType} eventName - The event type.
     * @param {jibo.animate.LookatBuilder~LookatEventCallback} callback - The listener function.
     */
    off: function (eventName, callback) {
    },
    /**
     * Sets the DOFs to be used in the lookat/orient behavior.
     *
     * Commonly-used DOF groups are defined in [animate.dofs]{@link jibo.animate.dofs}.
     * @method jibo.animate.LookatBuilder#setDOFs
     * @param {jibo.animate.DOFSet|string[]} dofNames - Names of DOFs to use; null to use all DOFs.
     */
    setDOFs: function (dofNames) {
    },
    /**
     * Gets the DOFs currently specified for this builder.
     * @method jibo.animate.LookatBuilder#getDOFs
     * @return {string[]}
     */
    getDOFs: function () {
    },
    /**
     * Sets the lookat behavior's base-blending policy.
     *
     * This policy only has an effect if the behavior is configured to control the robot's base DOF.
     * @method jibo.animate.LookatBuilder#setOrientFully
     * @param {boolean} orientFully If `true`, the behavior will seize exclusive control of
     * the robot's base DOF. If `false`, the behavior will blend additively with any ongoing animation or postural
     * offset on the base DOF.
     */
    setOrientFully: function (orientFully) {
    },
    /**
     * Turns continuous mode for the lookat behavior on or off.
     * @method jibo.animate.LookatBuilder#setContinuousMode
     * @param {boolean} isContinuous If `false`, the lookat behavior will stop when the target
     * is reached. If `true`, the lookat behavior will continue indefinitely, allowing the target to be modified
     * at any time via [updateTarget]{@link jibo.animate.LookatInstance#updateTarget}.
     */
    setContinuousMode: function (isContinuous) {
    }
    /* end interface definition:        */
    /* eslint-enable no-unused-vars */
};
var animate = {
    MODALITY_NAME: "MOTION",
    /**
     * Create an instance of the Animation Utilities API.
     * If both MotionTimeline and RobotInfo are provided, the instance will be fully initialized and ready for use.
     * Otherwise, the init() method must be used to complete initialization.
     * @method jibo.animate#createAnimationUtilities
     * @param {MotionTimeline} [timeline]
     * @param {RobotInfo} [robotInfo]
     * @return {AnimationUtilities}
     */
    createAnimationUtilities: function (timeline, robotInfo) {
        var animationUtilities = new AnimationUtilities();
        if (timeline && robotInfo) {
            animationUtilities.init(timeline, robotInfo);
        }
        return animationUtilities;
    }
};
animate.trajectory = {
    /**
     * @private
     * @callback jibo.animate~AnimationLoadedCallback
     * @param {AnnotatedMotion} motion - motion that was loaded
     */
    /**
     * @method jibo.animate#getAnimation
   * @private
     * @param {string} uri
     * @param {AnimationLoadedCallback} callback
     * @param {?boolean} [forceReload] - optional, defaults to not forcing reload
     */
    getAnimation: function (uri, callback, forceReload) {
        var result;
        if (!forceReload) {
            result = animationCache[uri];
        }
        if (result) {
            if (callback) {
                callback(new AnnotatedMotion(result.motion, result.events));
            }
        }
        else {
            animationLoader.load(uri, function () {
                var animResult = animationLoader.getResult();
                if (animResult.success) {
                    animationCache[uri] = animResult;
                    if (callback) {
                        callback(new AnnotatedMotion(animResult.motion, animResult.events));
                    }
                }
                else {
                    slog.error("animation load failed, " + animResult.message + " with URL:\"" + uri + "\"");
                    if (callback) {
                        callback(null);
                    }
                }
            });
        }
    },
    /**
     * Parse a pre-loaded (or pre-assembled) animation data structure.
     * The data object must match the structure specified for on-disk animation files.
     * @method jibo.animate#parseAnimation
     * @param {Object} animationData - the animation data object
     * @param {string} [parentDirectoryURI] - optional; if present, texture paths will be resolved relative to the specified directory
     * @param {string} [cacheKey] - optional; if present, results will be cached using the specified key
     *
     * @return {AnnotatedMotion} The resulting motion instance, or null if parse failed
     */
    parseAnimation: function (animationData, parentDirectoryURI, cacheKey) {
        var result = null;
        if (cacheKey) {
            result = animationCache[cacheKey];
        }
        if (result) {
            return new AnnotatedMotion(result.motion, result.events);
        }
        else {
            var loader = new AnimationLoader();
            if (parentDirectoryURI) {
                var lastChar = parentDirectoryURI.slice(-1);
                if (!(lastChar === "/" || lastChar === "\\")) {
                    parentDirectoryURI = parentDirectoryURI + "/";
                }
                loader.resolvePaths = true;
            }
            else {
                loader.resolvePaths = false;
            }
            loader.parseData(animationData, parentDirectoryURI);
            var animResult = loader.getResult();
            if (animResult.success) {
                if (cacheKey) {
                    animationCache[cacheKey] = animResult;
                }
                return new AnnotatedMotion(animResult.motion, animResult.events);
            }
            else {
                slog.error("animation parse failed: " + animResult.message);
                return null;
            }
        }
    },
    createLinearTransitionBuilder: function (robotInfo) {
        return new LinearTransitionBuilder(robotInfo);
    },
    createAccelerationTransitionBuilder: function (robotInfo, defaultMaxVelocity, defaultMaxAcceleration) {
        return new AccelerationTransitionBuilder(robotInfo, defaultMaxVelocity, defaultMaxAcceleration);
    }
};
/**
 * Enum Values for animation builder event types, for use with AnimationBuilder's [on]{@link jibo.animate.AnimationBuilder#on} method.
 * @enum {string}
 * @memberof jibo.animate
 */
var AnimationEventType = {
    /**
     * Animation started.
     */
    STARTED: "STARTED",
    /**
     * Animation stopped or interrupted; check event payload's 'interrupted' property (boolean).
     */
    STOPPED: "STOPPED",
    /**
     * Animation cancelled before starting.
     */
    CANCELLED: "CANCELLED",
    /**
     * Custom animation event fired.
     */
    EVENT: "EVENT" //custom event
};
animate.AnimationEventType = AnimationEventType;
/**
 * Enum Values for lookat builder event types, for use with LookatBuilder's [on]{@link jibo.animate.LookatBuilder#on} method.
 * @enum {string}
 * @memberof jibo.animate
 */
var LookatEventType = {
    /**
     * Lookat started.
     */
    STARTED: "STARTED",
    /**
     * Lookat target reached.
     */
    TARGET_REACHED: "TARGET_REACHED",
    /**
     * Lookat target superseded.
     */
    TARGET_SUPERSEDED: "TARGET_SUPERSEDED",
    /**
     * Lookat stopped or interrupted; check event payload's 'interrupted' property (boolean).
     */
    STOPPED: "STOPPED",
    /**
     * Lookat cancelled before starting.
     */
    CANCELLED: "CANCELLED" //will not start
};
animate.LookatEventType = LookatEventType;
module.exports = animate;

},{"../animation-visualize/RendererOutput":43,"../geometry-info/DOFSet":45,"../ifr-core/SLog":57,"../ifr-motion/base/AnnotatedMotion":68,"../ifr-motion/base/Motion":74,"../ifr-motion/base/MotionEventIterator":76,"../ifr-motion/base/Pose":78,"../ifr-motion/base/RelativeTimeClip":79,"../ifr-motion/loaders/AnimationLoader":96,"../ifr-motion/lookat/KinematicFeaturesReporter":101,"../ifr-motion/lookat/PlaneDisplacementLookatDOF":114,"./AccelerationTransitionBuilder":1,"./LinearTransitionBuilderImpl":3,"./SingleLookatBuilder":4,"./timeline/LookatBlendGenerator":11,"./timeline/LoopedMotionGenerator":14,"./timeline/PoseMotionGenerator":18,"./timeline/SimpleMotionGenerator":22,"./timeline/TimelineEventDispatcher":23,"./timeline/VariableSpeedMotionGenerator":24,"@jibo/three":undefined}],3:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var Motion = require("../ifr-motion/base/Motion");
//var MotionValidator = require("../ifr-motion/base/MotionValidator");
var MotionTrack = require("../ifr-motion/base/MotionTrack");
var TimestampedBuffer = require("../ifr-motion/base/TimestampedBuffer");
var TransitionBuilder = require("./TransitionBuilder");
/**
 * Protected constructor for internal use only.
 *
 * LinearTransitionBuilders generate transition motions via simple linear blending.
 *
 * LinearTransitionBuilders can be created via the animation module's
 * [createLinearTransitionBuilder]{@link jibo.animate#createLinearTransitionBuilder} method.
 *
 * @param {jibo.animate.RobotInfo} robotInfo - Protected constructor parameter.
 * @class LinearTransitionBuilder
 * @intdocs
 * @memberof jibo.animate
 * @extends jibo.animate.TransitionBuilder
 * @protected
 */
var LinearTransitionBuilder = function (robotInfo) {
    TransitionBuilder.call(this);
    /** @type {number} */
    /** @private */
    this._transitionTime = 1;
    /** @type {number} */
    /** @private */
    this._defaultMaxVelocity = null;
    /** @type {Object<string,number>} */
    /** @private */
    this._maxVelocityByDOF = null;
    /** @type {RobotInfo} */
    /** @private */
    this._robotInfo = robotInfo;
};
LinearTransitionBuilder.prototype = Object.create(TransitionBuilder.prototype);
LinearTransitionBuilder.prototype.constructor = LinearTransitionBuilder;
/**
 * Sets this transition to use a fixed duration transition regardless of joint positions.
 *
 * Overrides previous settings from setTransitionTime or setMaxVelocity.
 * @method jibo.animate.LinearTransitionBuilder#setTransitionTime
 * @param {number} time - Fixed transition time.
 */
LinearTransitionBuilder.prototype.setTransitionTime = function (time) {
    this._transitionTime = time;
    this._defaultMaxVelocity = null;
    this._maxVelocityByDOF = null;
};
/**
 * Sets this transition to compute time based on the distance to travel and max velocity
 * of the joints.
 *
 * Overrides previous settings from setTransitionTime or setMaxVelocity.
 * @method jibo.animate.LinearTransitionBuilder#setMaxVelocity
 * @param {number} defaultMaxVelocity - Use this velocity for all joints not in the map.
 * @param {Object<string,number>} maxVelocityByDOFMap - Override default for joints present in the map.
 */
LinearTransitionBuilder.prototype.setMaxVelocity = function (defaultMaxVelocity, maxVelocityByDOFMap) {
    this._defaultMaxVelocity = defaultMaxVelocity;
    this._maxVelocityByDOF = maxVelocityByDOFMap;
    this._transitionTime = null;
};
/**
 *
 * Generates a procedural transition motion using the configuration specified by this builder.
 * @method jibo.animate.LinearTransitionBuilder#generateTransition
 * @param {Pose} fromPose - Starting pose for the transition.  Should have at least onDOFs, and also all unused DOFs (ancestors) required to calculate correct global paths.
 * @param {Motion} toMotion - Motion to use as the destination for the transition.  Should have at least onDOFs.
 * @param {number} timeOffsetInTo - Time offset to target in the destination motion.
 * @param {string[]} onDOFs - DOFs to use for the transition.
 *
 * @return {Motion}
 * @override
 */
LinearTransitionBuilder.prototype.generateTransition = function (fromPose, toMotion, timeOffsetInTo, onDOFs) {
    var dofName, valueFrom, valueTo, di;
    //check validity
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        if (!this._robotInfo.getDOFInfo(dofName)) {
            throw new Error("Error transitioning, no dofInfo found for " + dofName);
        }
        //if(!toMotion.getTracks()[dofName]){
        //	throw new Error("Error transitioning, no TO value for "+dofName);
        //}
        var fromVar = fromPose.get(dofName, 0);
        if (fromVar == null || (Array.isArray(fromVar) && fromVar.length < 1)) {
            throw new Error("Error transitioning, no FROM value for " + dofName);
        }
    }
    //TODO: enable MotionValidator via DEBUG flag
    //MotionValidator.valuesExist(toMotion, onDOFs);
    var interpolatorSet = this._robotInfo.getKinematicInfo().getInterpolatorSet();
    var transition = new Motion("Transition:" + toMotion.getName());
    var duration = 0;
    var toPoseInMotion = toMotion.getPoseAtTime(timeOffsetInTo, interpolatorSet);
    var toPose = fromPose.getCopy();
    //toPose will be fromPose for all unaffected joints, and will get the position
    //from toMotion for affected joints.
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        //We only copy position, as velocity will be assumed zero below
        toPose.set(dofName, toPoseInMotion.get(dofName, 0), 0);
    }
    var dga = this._robotInfo.getKinematicInfo().getDOFGlobalAlignment();
    dga.refineToGloballyClosestTargetPose(fromPose, toPose, onDOFs);
    if (this._transitionTime !== null) {
        //fixed time is selected
        duration = this._transitionTime;
    }
    else {
        //var slowestJoint;
        //var slowestJointDistance;
        //velocity mode is selected, generate time based on distance to travel and selected velocity
        for (di = 0; di < onDOFs.length; di++) {
            dofName = onDOFs[di];
            if (this._robotInfo.getDOFInfo(dofName).isMetric()) {
                valueFrom = fromPose.get(dofName, 0);
                //we are going to go to the animation with target velocity zero at arrival.  if non-zero velocity entertained,
                //make sure to account for it above when setting up toPose (which currently has arbitrary velocities)
                valueTo = toPose.get(dofName, 0);
                var velocity = this._defaultMaxVelocity;
                if (this._maxVelocityByDOF && this._maxVelocityByDOF[dofName]) {
                    //this dof has a custom velocity selected
                    velocity = this._maxVelocityByDOF[dofName];
                }
                var distance = Math.abs(valueTo - valueFrom);
                var myTime = distance / velocity;
                if (myTime > duration) {
                    duration = myTime;
                    //slowestJoint = dofName;
                    //slowestJointDistance = distance;
                }
            }
        }
        //console.log("LinearTransitionBuilder: DOF:"+slowestJoint+" drove a transition time of "+duration+" for distance "+slowestJointDistance);
    }
    for (di = 0; di < onDOFs.length; di++) {
        dofName = onDOFs[di];
        valueFrom = fromPose.get(dofName);
        valueTo = toPose.get(dofName, 0);
        var dataNew = new TimestampedBuffer();
        dataNew.append(0, valueFrom);
        dataNew.append(duration, valueTo);
        transition.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return transition;
};
/**
 * Clones this builder.
 * @method jibo.animate.LinearTransitionBuilder#clone
 * @return {jibo.animate.LinearTransitionBuilder}
 * @override
 */
LinearTransitionBuilder.prototype.clone = function () {
    var t = new LinearTransitionBuilder(this._robotInfo);
    //shallow copy all primary fields.
    var keys = Object.keys(this);
    for (var i = 0; i < keys.length; i++) {
        t[keys[i]] = this[keys[i]];
    }
    return t;
};
module.exports = LinearTransitionBuilder;

},{"../ifr-motion/base/Motion":74,"../ifr-motion/base/MotionTrack":77,"../ifr-motion/base/TimestampedBuffer":81,"./TransitionBuilder":5}],4:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var MotionLookat = require("../ifr-motion/lookat/MotionLookat");
var LookatNode = require("../ifr-motion/lookat/LookatNode");
var LookatMotionNode = require("../ifr-motion/lookat/LookatMotionNode");
var OcularStabilizationTracker = require("../ifr-motion/lookat/OcularStabilizationTracker");
var DiskStabilizationTracker = require("../ifr-motion/lookat/DiskStabilizationTracker");
var RotationalLookatDOF = require("../ifr-motion/lookat/RotationalLookatDOF");
var RotationalPlaneAlignmentLookatDOF = require("../ifr-motion/lookat/RotationalPlaneAlignmentLookatDOF");
var PlaneDisplacementLookatDOF = require("../ifr-motion/lookat/PlaneDisplacementLookatDOF");
var PlaneAlignmentWithRollLookatDOF = require("../ifr-motion/lookat/PlaneAlignmentWithRollLookatDOF");
var PlaneAlignmentWithRollLookatNode = require("../ifr-motion/lookat/PlaneAlignmentWithRollLookatNode");
var Pose = require("../ifr-motion/base/Pose");
var Motion = require("../ifr-motion/base/Motion");
var THREE = require("@jibo/three");
var SimpleMotionGenerator = require("./timeline/SimpleMotionGenerator");
var slog = require("../ifr-core/SLog");
var LookatMultiLayerStatusManager = require("./timeline/LookatMultiLayerStatusManager");
var DOFSet = require("../geometry-info/DOFSet");
var LookatNodeTrackPolicy = require("../ifr-motion/lookat/trackpolicy/LookatNodeTrackPolicy");
var TrackPolicyTriggerAlways = require("../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerAlways");
var TrackPolicyTriggerDiscomfort = require("../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerDiscomfort");
var TrackPolicyTriggerMovementTerminated = require("../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerMovementTerminated");
var TrackPolicyTriggerOnOtherNode = require("../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerOnOtherNode");
var LookatBlinkManager = require("../ifr-motion/lookat/LookatBlinkManager");
var LookatNodeTargetAdjuster = require("../ifr-motion/lookat/LookatNodeTargetAdjuster");
var LookatWindupPolicy = require("../ifr-motion/lookat/LookatWindupPolicy");
var LookatOrientationStatusReporter = require("../ifr-motion/lookat/LookatOrientationStatusReporter");
var WorldTargetAdjuster = require("../ifr-motion/lookat/WorldTargetAdjuster");
var channel = "LOOKAT";
/**
 * @callback LookatEventCallback
 * @param {string} eventName
 * @param {LookatInstance} lookatInstance - lookat instance that generated this event
 * @param {Object.<string,*>} payload - extra information provided here, depending on event (See LookatEventType)
 * @private
 */
/**
 * Enum Values for lookat builder event types.
 * @enum {string}
 * @private
 */
var LookatEventType = {
    STARTED: "STARTED",
    TARGET_REACHED: "TARGET_REACHED",
    TARGET_SUPERSEDED: "TARGET_SUPERSEDED",
    /**
     * reported when look stops; check interrupted boolean description property in payload
     * (interrupted is true if look stopped without reaching target)
     */
    STOPPED: "STOPPED",
    CANCELLED: "CANCELLED" //will not start
};
/**
 * Enum Values for overall lookat mode
 * @enum {string}
 * @private
 */
var LookatConfig = {
    SQUARE_BASE: "SQUARE_BASE",
    LEVEL_HEAD: "LEVEL_HEAD"
};
/**
 * @param {number} acceleration
 * @param {number} velocity
 * @param {?number} [TPTDLimitInner] - inner limit to start accumulating discomfort.  null here will mean no discomfort accumulation (move always policy will be used instead)
 * @param {?number} [TPTDLimitOuter]
 * @param {?number} [TPTDAccumInner]
 * @param {?number} [TPTDAccumOuter]
 * @param {?boolean} [TPTDMoveImmediatelyPastOuter]
 * @param {?boolean} [TPTPMoveIfParentMoves] - true to trigger a motion if parent moves independently of my own discomfort
 * @param {?number} [TPTMTDeadZone] - spatial deadzone radius.  null here will mean no termination criteria
 * @param {?number} [TPTMTDeadTime]
 * @param {?number} [TPTMTDeadVelocity]
 * @param {?number} [BPTriggerDelta] - trigger a blink when a target is this far away.  null here will mean no blink manager
 * @param {?number} [BPRetriggerTimeSameTrajectory] - this much time must pass between blinks on a single trajectory (no stop between them)
 * @param {?number} [BPRetriggerTimeCrossTrajectory] - this much time must pass between blinks on separate trajectories (a stop occured between them)
 * @param {?number} [BPTrajectorySeparatorDelta] - this small of a delta indicates a stop happened (relevant for arbitrating between the 2 previous timings)
 * @param {?number} [TAUndershootDistance] - if provided, node will use a target adjuster and this will be the undershoot distance
 * @param {?number} [WPTargetDeltaToTriggerNewWindup] - worldspace target delta to trigger new windup (also triggered on new lookat)
 * @param {?number} [WPMaxAllowedTriggerSpeed] - Windup/Overshoot: maximum speed (for any particular dof) allowable for starting a new windup/overshoot trajectory
 * @param {?number} [WPMinAllowedTriggerDistance] - Windup/Overshoot: minimum current-to-target distance allowable for starting a new windup/overshoot trajectory
 * @param {?number} [WPMaxAllowedTriggerDistance] - Windup/Overshoot: maximum current-to-target distance allowable for starting a new windup/overshoot trajectory
 * @param {?number} [WMWindupDistanceRatio] - Windup: fraction of current-to-target distance which defines the windup distance
 * @param {?number} [WPWindupMinDistance] - Windup: clamp windup distance to this minimum (windups will be no smaller)
 * @param {?number} [WPWindupMaxDistance] - Windup: clamp windup distance to this maximum (windups will be no larger)
 * @param {?number} [WPOvershootDistanceRatio] - Overshoot: fraction of current-to-target distance which defines the overshoot distance
 * @param {?number} [WPOvershootMinDistance] - Overshoot: clamp overshoot distance to this minimum (overshoots will be no smaller)
 * @param {?number} [WPOvershootMaxDistance] - Overshoot: clamp overshoot distance to this maximum (overshoot will be no larger)
 * @param {?number} [WTALeft] - rotate world target location left by this amount
 * @param {?number} [WTADown] - rotate world target location down by this amount
 * @param {?boolean} [LHForbidTilt] - forbid poses with tilt when in level head
 * @param {?SOLUTION_POLICY} [LHSolutionPolicy] - choose policy for which of multiple solutions to choose
 * @constructor
 * @private
 */
var LookatNodeRuntimeConfig = function (velocity, acceleration, TPTDLimitInner, TPTDLimitOuter, TPTDAccumInner, TPTDAccumOuter, TPTDMoveImmediatelyPastOuter, TPTPMoveIfParentMoves, TPTMTDeadZone, TPTMTDeadTime, TPTMTDeadVelocity, BPTriggerDelta, BPRetriggerTimeSameTrajectory, BPRetriggerTimeCrossTrajectory, BPTrajectorySeparatorDelta, BPOnlyAtOrAfterWindupPhase, TAUndershootDistance, WPTargetDeltaToTriggerNewWindup, WPMaxAllowedTriggerSpeed, WPMinAllowedTriggerDistance, WPMaxAllowedTriggerDistance, WMWindupDistanceRatio, WPWindupMinDistance, WPWindupMaxDistance, WPOvershootDistanceRatio, WPOvershootMinDistance, WPOvershootMaxDistance, WTALeft, WTADown, LHForbidTilt, LHSolutionPolicy) {
    //filter parameters
    /** @type {number} */
    this.velocity = velocity;
    /** @type {number} */
    this.acceleration = acceleration;
    //discomfort motion trigger
    /** @type {?number} */
    this.TPTDLimitInner = TPTDLimitInner;
    /** @type {?number} */
    this.TPTDLimitOuter = TPTDLimitOuter;
    /** @type {?number} */
    this.TPTDAccumInner = TPTDAccumInner;
    /** @type {?number} */
    this.TPTDAccumOuter = TPTDAccumOuter;
    /** @type {?boolean} */
    this.TPTDMoveImmediatelyPastOuter = TPTDMoveImmediatelyPastOuter;
    /** @type {?boolean} */
    this.TPTPMoveIfParentMoves = TPTPMoveIfParentMoves;
    //motion termination trigger
    /** @type {?number} */
    this.TPTMTDeadZone = TPTMTDeadZone;
    /** @type {?number} */
    this.TPTMTDeadTime = TPTMTDeadTime;
    /** @type {?number} */
    this.TPTMTDeadVelocity = TPTMTDeadVelocity;
    //blink policy
    /** @type {?number} */
    this.BPTriggerDelta = BPTriggerDelta;
    /** @type {?number} */
    this.BPRetriggerTimeSameTrajectory = BPRetriggerTimeSameTrajectory;
    /** @type {?number} */
    this.BPRetriggerTimeCrossTrajectory = BPRetriggerTimeCrossTrajectory;
    /** @type {?number} */
    this.BPTrajectorySeparatorDelta = BPTrajectorySeparatorDelta;
    /** @type {?number} */
    this.BPOnlyAtOrAfterWindupPhase = BPOnlyAtOrAfterWindupPhase;
    //target adjuster (lazy undershoot)
    /** @type {?number} */
    this.TAUndershootDistance = TAUndershootDistance;
    //windup policy
    this.WPTargetDeltaToTriggerNewWindup = WPTargetDeltaToTriggerNewWindup;
    /** @type {?number} */
    this.WPMaxAllowedTriggerSpeed = WPMaxAllowedTriggerSpeed;
    /** @type {?number} */
    this.WPMinAllowedTriggerDistance = WPMinAllowedTriggerDistance;
    /** @type {?number} */
    this.WPMaxAllowedTriggerDistance = WPMaxAllowedTriggerDistance;
    /** @type {?number} */
    this.WMWindupDistanceRatio = WMWindupDistanceRatio;
    /** @type {?number} */
    this.WPWindupMinDistance = WPWindupMinDistance;
    /** @type {?number} */
    this.WPWindupMaxDistance = WPWindupMaxDistance;
    /** @type {?number} */
    this.WPOvershootDistanceRatio = WPOvershootDistanceRatio;
    /** @type {?number} */
    this.WPOvershootMinDistance = WPOvershootMinDistance;
    /** @type {?number} */
    this.WPOvershootMaxDistance = WPOvershootMaxDistance;
    /** @type {?number} */
    this.WTALeft = WTALeft;
    /** @type {?number} */
    this.WTADown = WTADown;
    /** @type {?boolean} */
    this.LHForbidTilt = LHForbidTilt;
    /** @type {?SOLUTION_POLICY} */
    this.LHSolutionPolicy = LHSolutionPolicy;
};
/**
 * @param {number} min
 * @param {number} max
 * @constructor
 * @private
 */
var LookatDOFRuntimeConfig = function (min, max) {
    /** @type {number} */
    this.min = min;
    /** @type {number} */
    this.max = max;
};
var LookatDOFGeometryConfig = {
    BaseLookatDOF: {
        LookatDOFName: "BaseLookatDOF",
        DOFName: "bottomSection_r",
        Forward: new THREE.Vector3(0, 0, -1)
    },
    TorsoLookatDOF: {
        LookatDOFName: "TorsoLookatDOF",
        DOFName: "middleSection_r",
        PlaneNormal: new THREE.Vector3(9.509979E-9, 0.9271838, 0.37460676),
        DistanceAlongAxisToDOFPlane: 0.18703285,
        AngleAbovePlane: 0.29670632
    },
    TrunkLookatDOF: {
        LookatDOFName: "TrunkLookatDOF",
        OrientDOFName: "bottomSection_r",
        TiltDOFName: "middleSection_r",
        SwivelDOFName: "topSection_r",
        OrientDOFMinForward: 0,
        TiltDOFMinForward: Math.PI,
        DistanceAlongAxisToDOFPlane: 0.2174,
        AngleAbovePlane: 0.29670632,
        SwingArmFactor: 0.676
    },
    TopLookatDOF: {
        LookatDOFName: "TopLookatDOF",
        DOFName: "topSection_r",
        Forward: new THREE.Vector3(0, 0, -1)
    },
    EyeLeftRight: {
        LookatDOFName: "EyeLeftRight",
        DOFName: "eyeSubRootBn_t",
        CentralTransformName: "eyeRootBn",
        Forward: new THREE.Vector3(0, 0, 1),
        PlaneNormal: new THREE.Vector3(0, 1, 0),
        InternalDistance: 0.0165,
        MinValue: -0.03450607937,
        MaxValue: 0.03450607937
    },
    EyeUpDown: {
        LookatDOFName: "EyeUpDown",
        DOFName: "eyeSubRootBn_t_2",
        CentralTransformName: "eyeRootBn",
        Forward: new THREE.Vector3(0, 0, 1),
        PlaneNormal: new THREE.Vector3(-1, 0, 0),
        InternalDistance: 0.013,
        MinValue: -0.00609550625,
        MaxValue: 0.00609550625
    }
};
/**
 * @param {AnimationUtilities} animUtils
 * @param {MotionTimeline} timeline
 * @param {RobotInfo} robotInfo
 * @param {TransitionBuilder} transition
 * @param {LookatEventCallback} [globalDelegate]
 * @param {BlinkDelegate} [blinkDelegate]
 * @constructor
 * @private
 */
var SingleLookatBuilder = function (animUtils, timeline, robotInfo, transition, globalDelegate, blinkDelegate) {
    var self = this;
    /** @type {LookatConfig} */
    var lookatConfig = LookatConfig.SQUARE_BASE;
    /** @type {Object.<string,LookatNodeRuntimeConfig>} */
    var lookatNodeRuntimeConfigs = {
        //BaseLookatNode:new LookatNodeRuntimeConfig(null, 3, 0.1, 0.9, 0.2, 3, true, 0.1, 0.05),
        TrunkLookatNode: new LookatNodeRuntimeConfig(null, 3, 0.00001, 0.00001, null, null, true, false, 0.001, 0.01, 0.018, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, false, PlaneAlignmentWithRollLookatDOF.SOLUTION_POLICY.CLOSEST),
        BaseLookatNode: new LookatNodeRuntimeConfig(null, 3, 0.00001, 0.00001, null, null, true, false, 0.001, 0.01, 0.018, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
        TorsoLookatNode: new LookatNodeRuntimeConfig(null, 2.5, 0.00001, 0.00001, null, null, true, false, 0.001, 0.01, 0.018, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
        TopLookatNode: new LookatNodeRuntimeConfig(null, 3, 0.00001, 0.00001, null, null, true, false, 0.001, 0.01, 0.018, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null),
        Eye: new LookatNodeRuntimeConfig(null, 1, 0.000001, 0.000001, null, null, true, false, 0.0001, 0.01, 0.0005, null, 2, 1, 0.001, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null)
    };
    /** @type {Object.<string,LookatDOFRuntimeConfig>} */
    var lookatDOFRuntimeConfigs = {
        bottomSection_r: new LookatDOFRuntimeConfig(null, null),
        middleSection_r: new LookatDOFRuntimeConfig(null, null),
        topSection_r: new LookatDOFRuntimeConfig(null, null),
        eyeSubRootBn_t: new LookatDOFRuntimeConfig(LookatDOFGeometryConfig["EyeLeftRight"].MinValue, LookatDOFGeometryConfig["EyeLeftRight"].MaxValue),
        eyeSubRootBn_t_2: new LookatDOFRuntimeConfig(LookatDOFGeometryConfig["EyeUpDown"].MinValue, LookatDOFGeometryConfig["EyeUpDown"].MaxValue)
    };
    var orientationStatusReporter = new LookatOrientationStatusReporter(LookatDOFGeometryConfig["BaseLookatDOF"].DOFName, [LookatDOFGeometryConfig["BaseLookatDOF"].DOFName], [LookatDOFGeometryConfig["TopLookatDOF"].DOFName]);
    /**
     *
     * @param {LookatNodeRuntimeConfig} config
     * @param {?LookatNodeTrackPolicy[]} parentTrackPolicies
     * @return {?LookatNodeTrackPolicy}
     */
    var getTrackPolicy = function (config, parentTrackPolicies) {
        /** @type {TrackPolicyTrigger[]} */
        var triggers = [];
        if (config.TPTPMoveIfParentMoves && parentTrackPolicies != null && parentTrackPolicies.length > 0) {
            var parentBasedTrigger = new TrackPolicyTriggerOnOtherNode();
            for (var i = 0; i < parentTrackPolicies.length; i++) {
                parentTrackPolicies[i].addListener(parentBasedTrigger);
            }
            triggers.push(parentBasedTrigger);
        }
        if (config.TPTDLimitInner != null) {
            //assume all present if any present
            triggers.push(new TrackPolicyTriggerDiscomfort(config.TPTDLimitInner, config.TPTDLimitOuter, config.TPTDAccumInner, config.TPTDAccumOuter, config.TPTDMoveImmediatelyPastOuter));
            triggers.push(new TrackPolicyTriggerMovementTerminated(config.TPTMTDeadZone, config.TPTMTDeadTime, config.TPTMTDeadVelocity));
        }
        else {
            triggers.push(new TrackPolicyTriggerAlways());
        }
        return new LookatNodeTrackPolicy(triggers);
    };
    /**
     *
     * @param {?BlinkDelegate} blinkDelegate
     * @param {LookatNodeRuntimeConfig} config
     * @return {?LookatBlinkManager}
     */
    var getBlinkManager = function (blinkDelegate, config) {
        if (blinkDelegate != null && config.BPTriggerDelta != null) {
            return new LookatBlinkManager(blinkDelegate, config.BPTriggerDelta, config.BPRetriggerTimeSameTrajectory, config.BPRetriggerTimeCrossTrajectory, config.BPTrajectorySeparatorDelta, config.BPOnlyAtOrAfterWindupPhase);
        }
        else {
            return null;
        }
    };
    /**
     *
     * @param {LookatNodeRuntimeConfig} config
     * @return {?LookatNodeTargetAdjuster}
     */
    var getTargetAdjuster = function (config) {
        if (config.TAUndershootDistance != null) {
            return new LookatNodeTargetAdjuster(config.TAUndershootDistance);
        }
        else {
            return null;
        }
    };
    /**
     *
     * @param {LookatNodeRuntimeConfig} config
     * @return {?WorldTargetAdjuster}
     */
    var getWorldTargetAdjuster = function (config) {
        if (config.WTALeft != null || config.WTADown != null) {
            var left = config.WTALeft || 0;
            var down = config.WTADown || 0;
            var worldUp = new THREE.Vector3(0, 0, 1);
            return new WorldTargetAdjuster(left, down, worldUp);
        }
        else {
            return null;
        }
    };
    /**
     *
     * @param {LookatNodeRuntimeConfig} config
     * @return {?LookatWindupPolicy}
     */
    var getWindupPolicy = function (config) {
        if (config.WPTargetDeltaToTriggerNewWindup != null) {
            return new LookatWindupPolicy(config.WPTargetDeltaToTriggerNewWindup, config.WPMaxAllowedTriggerSpeed, config.WPMinAllowedTriggerDistance, config.WPMaxAllowedTriggerDistance, config.WMWindupDistanceRatio, config.WPWindupMinDistance, config.WPWindupMaxDistance, config.WPOvershootDistanceRatio, config.WPOvershootMinDistance, config.WPOvershootMaxDistance);
        }
        else {
            return null;
        }
    };
    /**
     * @return {MotionLookat}
     */
    var initLookat = function () {
        /** @type {KinematicGroup} */
        var kinematicGroupProto = robotInfo.getKinematicInfo().getFullKinematicGroup();
        var dofAligner = robotInfo.getKinematicInfo().getDOFGlobalAlignment();
        var baseLookatNode, torsoLookatNode, trunkLookatNode;
        if (lookatConfig === LookatConfig.LEVEL_HEAD) {
            trunkLookatNode = new PlaneAlignmentWithRollLookatNode("TrunkLookatNode", new PlaneAlignmentWithRollLookatDOF(LookatDOFGeometryConfig["TrunkLookatDOF"].LookatDOFName, LookatDOFGeometryConfig["TrunkLookatDOF"].OrientDOFName, LookatDOFGeometryConfig["TrunkLookatDOF"].TiltDOFName, LookatDOFGeometryConfig["TrunkLookatDOF"].SwivelDOFName, LookatDOFGeometryConfig["TrunkLookatDOF"].OrientDOFMinForward, LookatDOFGeometryConfig["TrunkLookatDOF"].TiltDOFMinForward, LookatDOFGeometryConfig["TrunkLookatDOF"].DistanceAlongAxisToDOFPlane, LookatDOFGeometryConfig["TrunkLookatDOF"].AngleAbovePlane, lookatNodeRuntimeConfigs["TrunkLookatNode"].LHForbidTilt, lookatNodeRuntimeConfigs["TrunkLookatNode"].LHSolutionPolicy, LookatDOFGeometryConfig["TrunkLookatDOF"].SwingArmFactor), new RotationalLookatDOF(LookatDOFGeometryConfig["BaseLookatDOF"].LookatDOFName, LookatDOFGeometryConfig["BaseLookatDOF"].DOFName, LookatDOFGeometryConfig["BaseLookatDOF"].Forward));
        }
        if (lookatConfig === LookatConfig.SQUARE_BASE) {
            baseLookatNode = new LookatNode("BaseLookatNode", [
                new RotationalLookatDOF(LookatDOFGeometryConfig["BaseLookatDOF"].LookatDOFName, LookatDOFGeometryConfig["BaseLookatDOF"].DOFName, LookatDOFGeometryConfig["BaseLookatDOF"].Forward)
            ]);
            torsoLookatNode = new LookatNode("TorsoLookatNode", [
                new RotationalPlaneAlignmentLookatDOF(LookatDOFGeometryConfig["TorsoLookatDOF"].LookatDOFName, LookatDOFGeometryConfig["TorsoLookatDOF"].DOFName, LookatDOFGeometryConfig["TorsoLookatDOF"].PlaneNormal, LookatDOFGeometryConfig["TorsoLookatDOF"].DistanceAlongAxisToDOFPlane, LookatDOFGeometryConfig["TorsoLookatDOF"].AngleAbovePlane, true)
            ]);
        }
        var topLookatNode = new LookatNode("TopLookatNode", [
            new RotationalLookatDOF(LookatDOFGeometryConfig["TopLookatDOF"].LookatDOFName, LookatDOFGeometryConfig["TopLookatDOF"].DOFName, LookatDOFGeometryConfig["TopLookatDOF"].Forward)
        ]);
        var eyeLookatNode = new LookatNode("Eye", [
            new PlaneDisplacementLookatDOF(LookatDOFGeometryConfig["EyeLeftRight"].LookatDOFName, LookatDOFGeometryConfig["EyeLeftRight"].DOFName, LookatDOFGeometryConfig["EyeLeftRight"].CentralTransformName, LookatDOFGeometryConfig["EyeLeftRight"].Forward, LookatDOFGeometryConfig["EyeLeftRight"].PlaneNormal, LookatDOFGeometryConfig["EyeLeftRight"].InternalDistance, lookatDOFRuntimeConfigs["eyeSubRootBn_t"].min, lookatDOFRuntimeConfigs["eyeSubRootBn_t"].max),
            new PlaneDisplacementLookatDOF(LookatDOFGeometryConfig["EyeUpDown"].LookatDOFName, LookatDOFGeometryConfig["EyeUpDown"].DOFName, LookatDOFGeometryConfig["EyeUpDown"].CentralTransformName, LookatDOFGeometryConfig["EyeUpDown"].Forward, LookatDOFGeometryConfig["EyeUpDown"].PlaneNormal, LookatDOFGeometryConfig["EyeUpDown"].InternalDistance, lookatDOFRuntimeConfigs["eyeSubRootBn_t_2"].min, lookatDOFRuntimeConfigs["eyeSubRootBn_t_2"].max)
        ]);
        var ancestorTrackPolicies = [];
        var lookatMotionNodes = [];
        if (lookatConfig === LookatConfig.LEVEL_HEAD) {
            var trunkTrackPolicy = getTrackPolicy(lookatNodeRuntimeConfigs["TrunkLookatNode"], null);
            ancestorTrackPolicies.push(trunkTrackPolicy);
            lookatMotionNodes.push(new LookatMotionNode(trunkLookatNode, dofAligner, lookatNodeRuntimeConfigs["TrunkLookatNode"].acceleration, null, LookatMotionNode.LookStabilizationMode.UNTARGETED, trunkTrackPolicy, null, getTargetAdjuster(lookatNodeRuntimeConfigs["TrunkLookatNode"]), getWindupPolicy(lookatNodeRuntimeConfigs["TrunkLookatNode"]), getWorldTargetAdjuster(lookatNodeRuntimeConfigs["TrunkLookatNode"])));
        }
        if (lookatConfig === LookatConfig.SQUARE_BASE) {
            var baseTrackPolicy = getTrackPolicy(lookatNodeRuntimeConfigs["BaseLookatNode"], null);
            ancestorTrackPolicies.push(baseTrackPolicy);
            var torsoTrackPolicy = getTrackPolicy(lookatNodeRuntimeConfigs["TorsoLookatNode"], ancestorTrackPolicies);
            ancestorTrackPolicies.push(torsoTrackPolicy);
            lookatMotionNodes.push(new LookatMotionNode(baseLookatNode, dofAligner, lookatNodeRuntimeConfigs["BaseLookatNode"].acceleration, new OcularStabilizationTracker(baseLookatNode, dofAligner), LookatMotionNode.LookStabilizationMode.POINT_AUTO, baseTrackPolicy, null, getTargetAdjuster(lookatNodeRuntimeConfigs["BaseLookatNode"]), getWindupPolicy(lookatNodeRuntimeConfigs["BaseLookatNode"]), getWorldTargetAdjuster(lookatNodeRuntimeConfigs["BaseLookatNode"])));
            lookatMotionNodes.push(new LookatMotionNode(torsoLookatNode, dofAligner, lookatNodeRuntimeConfigs["TorsoLookatNode"].acceleration, new DiskStabilizationTracker(torsoLookatNode, dofAligner, ["bottomSection_r"]), LookatMotionNode.LookStabilizationMode.UNTARGETED, torsoTrackPolicy, null, getTargetAdjuster(lookatNodeRuntimeConfigs["TorsoLookatNode"]), getWindupPolicy(lookatNodeRuntimeConfigs["TorsoLookatNode"]), getWorldTargetAdjuster(lookatNodeRuntimeConfigs["TorsoLookatNode"])));
        }
        var topTrackPolicy = getTrackPolicy(lookatNodeRuntimeConfigs["TopLookatNode"], ancestorTrackPolicies);
        ancestorTrackPolicies.push(topTrackPolicy);
        lookatMotionNodes.push(new LookatMotionNode(topLookatNode, dofAligner, lookatNodeRuntimeConfigs["TopLookatNode"].acceleration, new OcularStabilizationTracker(topLookatNode, dofAligner), LookatMotionNode.LookStabilizationMode.POINT_AUTO, topTrackPolicy, null, getTargetAdjuster(lookatNodeRuntimeConfigs["TopLookatNode"]), getWindupPolicy(lookatNodeRuntimeConfigs["TopLookatNode"]), getWorldTargetAdjuster(lookatNodeRuntimeConfigs["TopLookatNode"])));
        var eyeTrackPolicy = getTrackPolicy(lookatNodeRuntimeConfigs["Eye"], ancestorTrackPolicies);
        ancestorTrackPolicies.push(eyeTrackPolicy);
        lookatMotionNodes.push(new LookatMotionNode(eyeLookatNode, dofAligner, lookatNodeRuntimeConfigs["Eye"].acceleration, new OcularStabilizationTracker(eyeLookatNode, dofAligner), LookatMotionNode.LookStabilizationMode.POINT_TARGET, eyeTrackPolicy, getBlinkManager(blinkDelegate, lookatNodeRuntimeConfigs["Eye"]), getTargetAdjuster(lookatNodeRuntimeConfigs["Eye"]), getWindupPolicy(lookatNodeRuntimeConfigs["Eye"]), getWorldTargetAdjuster(lookatNodeRuntimeConfigs["Eye"])));
        return new MotionLookat(lookatMotionNodes, kinematicGroupProto);
    };
    var shouldOrientFully = true;
    var continuous = false;
    /** @type {Object<LookatEventType,LookatEventCallback[]>} */
    var eventHandlers = {};
    //using the params structure to get list of all dofs for a full, unconstrained lookat
    //we used to use lookat.getDOFs(), which is ground truth, but we don't want to init MotionLookat yet.
    //this will be the same as long as lookatDOFRuntimeConfigs is kept up to date with dofs used
    //by the lookat, which is required in other init stages anyway.
    /** @type {string[]} */
    var allDOFsFullLookat = Object.keys(lookatDOFRuntimeConfigs);
    /** @type {Pose} */
    var lookPose = new Pose("LookPose", allDOFsFullLookat);
    /** @type {MotionLookat} */
    this.motionLookat = null;
    /**
     * @param {THREE.Vector3} target
     * @param {MotionLookat} lookat
     * @constructor
     * @private
     */
    var LookatInstance = function (target, lookat, multiTargetStatus) {
        target = target.clone(); //make sure we have a cached copy
        /** @type {LookatMotionGenerator} */
        var mainLayerClip = null;
        /** @type {LookatMotionGenerator} */
        var lookatLayerClip = null;
        /** @type {LookatMultiLayerStatusManager} */
        var statusManager = multiTargetStatus;
        this.getTarget = function () {
            return target;
        };
        /**
         * @param {THREE.Vector3|number[]} newTarget
         */
        this.updateTarget = function (newTarget) {
            if (Array.isArray(newTarget)) {
                target.set(newTarget[0], newTarget[1], newTarget[2]);
            }
            else {
                target.copy(newTarget);
            }
            statusManager.setTarget(target);
        };
        this.getBuilder = function () {
            return self;
        };
        this.getName = function () {
            return "lookat instance";
        };
        this.setClip = function (useMainClip, useLookatClip) {
            mainLayerClip = useMainClip;
            lookatLayerClip = useLookatClip;
        };
        this.stop = function () {
            if (mainLayerClip) {
                stopClip(mainLayerClip, "default");
            }
            if (lookatLayerClip) {
                stopClip(lookatLayerClip, "lookat");
            }
        };
        /**
         * @param {MotionGenerator} clip
         * @param {string} layer
         */
        var stopClip = function (clip, layer) {
            /** @type {jibo.animate.Time} */
            var stopTime = timeline.getClock().currentTime();
            //if all clips are fully committed, we will not stop
            if (!clip.endsAfter(stopTime)) {
                //stopTime is after clip is already over; cannot stop.  do nothing.
                slog.info("Ignoring stop on SingleLookat as it is already over");
                return;
            }
            //however we will not stop before any of the clips start!
            if (clip.getStartTime().isGreater(stopTime)) {
                stopTime = clip.getStartTime();
                slog.info("Stopping called on lookat before it started, moving stopTime forward");
            }
            /** @type {string[]} */
            var dofsToStop = [];
            /** @type {number[]} */
            var possibleDOFs = clip.getDOFIndices();
            for (var i = 0; i < possibleDOFs.length; i++) {
                if (clip.dofEndsAfter(possibleDOFs[i], stopTime)) {
                    dofsToStop.push(animUtils.dofIndicesToNames[possibleDOFs[i]]);
                }
            }
            //TODO: using zero-duration motion for now, might want to add explicit timeline stop() method
            /** @type {Pose} */
            var stopPose = new Pose("stop pose", dofsToStop);
            for (var d = 0; d < dofsToStop.length; d++) {
                stopPose.set(dofsToStop[d], [0]);
            }
            /** @type {Motion} */
            var stopMotion = Motion.createFromPose(clip.getName() + "_stop", stopPose, 0);
            var stopClip = new SimpleMotionGenerator(animUtils, stopMotion, stopTime, robotInfo);
            timeline.add(stopClip, layer);
        };
    };
    /**
     * We will keep the most recent status manager to see if we need to make a new MotionLookat
     * (we don't if the last lookat is done or only using dofs that we are about to override)
     * @type {LookatMultiLayerStatusManager}
     */
    var mostRecentStatusManager = null;
    /**
     * @param {THREE.Vector3|number[]} target
     * @return {LookatInstance}
     */
    this.startLookat = function (targetArg) {
        var i;
        /** @type {THREE.Vector3} */
        var target = null;
        if (Array.isArray(targetArg)) {
            target = new THREE.Vector3(targetArg[0], targetArg[1], targetArg[2]);
        }
        else {
            target = targetArg;
        }
        //var delay = (delayLookatStart !== undefined) ? delayLookatStart : 0;
        //var reactionTime = timeline.getReactionTime(animate.MODALITY_NAME, m);
        //var reactionTime = timeline.getReactionTime("MOTION", m);
        //delay = Math.max(delay, reactionTime);
        var startTime = timeline.getClock().currentTime();
        /** @type {boolean} */
        var mustInitLookat = false;
        if (self.motionLookat === null) {
            //console.log("We will init lookat since it was null");
            mustInitLookat = true;
        }
        if (!mustInitLookat && mostRecentStatusManager !== null) {
            var currentlyActiveDOFIndices = mostRecentStatusManager.getActiveDOFIndices(startTime);
            //if currentlyActiveDOFIndices has any DOFs NOT in our lookPose, we must make a new MotionLookat, because
            //we will not be fully overriding (removing) the existing instance, so we must let it continue unaffected
            //(if we do override all remaining dofs, we can re-use the MotionLookat)
            for (i = 0; i < currentlyActiveDOFIndices.length; i++) {
                if (!lookPose.hasDOFIndex(currentlyActiveDOFIndices[i])) {
                    //we are missing an active dof!  need a new MotionLookat
                    //console.log("We will init lookat since we are not overriding all joints, active:"+currentlyActiveDOFIndices+", ours:"+lookPose.getDOFIndices());
                    mustInitLookat = true;
                    break;
                }
            }
        }
        if (mustInitLookat === true) {
            self.motionLookat = initLookat();
        }
        var lookat = self.motionLookat;
        var multiLayerLook = false;
        var lookatLayerPose = timeline.getCurrentState(["lookat"]).getPose();
        var defaultLayerDOFs = [];
        var lookatLayerDOFs = [];
        var allLookDOFs = lookPose.getDOFNames();
        for (i = 0; i < allLookDOFs.length; i++) {
            if (lookatLayerPose.get(allLookDOFs[i]) !== null && multiLayerLook) {
                lookatLayerDOFs.push(allLookDOFs[i]);
            }
            else {
                defaultLayerDOFs.push(allLookDOFs[i]);
            }
        }
        var currentLayerState = timeline.getCurrentState(["default", "lookat"]);
        /** @type{Pose} */
        //var currentPose = timeline.getStateAtTime(animate.MODALITY_NAME, startTime);
        // transition from: the current "absolute" pose (combination of default and lookat layers)
        var currentPose = currentLayerState.getPose();
        /** @type{jibo.animate.Time} */
        var currentPoseTime = currentLayerState.getTime();
        /** @type {MotionGenerator} */
        var timelineClip = null;
        ///** @type {BaseMotionGenerator} */
        //var lookatStaticLayerClip;
        /** @type {LookatMultiLayerStatusManager} */
        var layersStatusManager = new LookatMultiLayerStatusManager(animUtils, lookat, startTime, target, continuous, orientationStatusReporter);
        var preRender = false;
        if (preRender) {
            lookat.reset();
            //var startTime = Clock.currentTime();
            var time = startTime;
            var poses = [];
            var times = [];
            var remainingDistance = Number.MAX_VALUE;
            while (remainingDistance > 0.001) {
                slog(channel, "Creating lookat pose at time " + time.subtract(startTime) + " with remaining:" + remainingDistance);
                lookat.generatePose(currentPose, lookPose, target, time);
                remainingDistance = lookat.getDistanceRemaining();
                var p = new Pose("Pose " + time, lookPose.getDOFNames());
                p.setPose(lookPose);
                poses.push(p);
                times.push(time.subtract(startTime));
                currentPose.setPose(lookPose);
                time = time.add(1 / 30.0);
            }
            var lookRenderedMotion = Motion.createFromPoses("ToLook", poses, times, time.subtract(startTime));
            timelineClip = new SimpleMotionGenerator(animUtils, lookRenderedMotion, startTime, robotInfo);
            //if (lookatLayerDOFs.length > 0) {
            //	var preRenderedLookatStaticLayerMotion = Motion.createFromPose("lookat target static", poses[poses.length - 1], lookRenderedMotion.getDuration(), lookatLayerDOFs);
            //	lookatStaticLayerClip = new SimpleMotionGenerator(animUtils, preRenderedLookatStaticLayerMotion, startTime, robotInfo);
            //}
        }
        else {
            /////initialize the lookat with the current state///////
            lookat.reset();
            var fullSystemPose = timeline.getCurrentState().getPose();
            var initPose = fullSystemPose.getCopy();
            var dofName;
            for (i = 0; i < lookatLayerDOFs.length; i++) {
                dofName = lookatLayerDOFs[i];
                if (shouldOrientFully) {
                    initPose.set(dofName, currentPose.get(dofName)); // starting DOF value should be default + lookat layer
                }
                else {
                    initPose.set(dofName, lookatLayerPose.get(dofName)); // starting DOF value should be lookat layer only
                }
                lookat.generatePoseIncremental(initPose, lookPose, target, currentPoseTime, initPose.getDOFIndexForName(dofName));
                initPose.set(dofName, fullSystemPose.get(dofName)); // reset DOF value to full system pose so children have correct current data
            }
            for (i = 0; i < defaultLayerDOFs.length; i++) {
                dofName = defaultLayerDOFs[i];
                initPose.set(dofName, currentPose.get(dofName)); // starting DOF value should be default + lookat layer
                lookat.generatePoseIncremental(initPose, lookPose, target, currentPoseTime, initPose.getDOFIndexForName(dofName));
                initPose.set(dofName, fullSystemPose.get(dofName)); // reset DOF value to full system pose so children have correct current data
            }
            /////////////////      done init        ////////////////
            timelineClip = layersStatusManager.createGenerator(defaultLayerDOFs);
            //if (lookatLayerDOFs.length > 0) {
            //	lookat.getOptimalPose(currentPose, lookPose, target);
            //	var activeLookatStaticLayerMotion = Motion.createFromPose("lookat target static", lookPose, Number.MAX_VALUE, lookatLayerDOFs);
            //	lookatStaticLayerClip = new SimpleMotionGenerator(animUtils, activeLookatStaticLayerMotion, startTime, robotInfo);
            //}
        }
        /** @type {LookatInstance} */
        var lookatInstance = new LookatInstance(target, lookat, layersStatusManager);
        layersStatusManager.setHandlers(createStartedHandler(lookatInstance), createStoppedHandler(lookatInstance), createRemovedHandler(lookatInstance), createTargetReachedHandler(lookatInstance), createTargetSupersededHandler(lookatInstance));
        // add the full lookat transition to the default layer
        timelineClip = timeline.add(timelineClip, "default");
        var lookLayerGenerator = null;
        if (lookatLayerDOFs.length > 0) {
            // add the static target lookat pose to the lookat layer, for future additive blending
            //timeline.add(lookatStaticLayerClip, "lookat");
            if (shouldOrientFully) {
                var zeroMotion = Motion.createFromPose("zero motion", robotInfo.getKinematicInfo().getDefaultPose().getCopy(), 1.0, lookatLayerDOFs);
                timeline.add(new SimpleMotionGenerator(animUtils, zeroMotion, startTime, robotInfo, lookatLayerDOFs), "default");
            }
            lookLayerGenerator = layersStatusManager.createGenerator(lookatLayerDOFs);
            timeline.add(lookLayerGenerator, "lookat");
        }
        lookatInstance.setClip(timelineClip, lookLayerGenerator);
        if (globalDelegate) {
            globalDelegate("ADDED", lookatInstance, { dofs: allLookDOFs });
        }
        mostRecentStatusManager = layersStatusManager;
        return lookatInstance;
    };
    /**
     * Register an event listener
     * @param {LookatEventType} eventName
     * @param {LookatEventCallback} callback
     */
    this.on = function (eventName, callback) {
        /** @type {LookatEventCallback[]} */
        var handlersForType = eventHandlers[eventName];
        if (!handlersForType) {
            handlersForType = [];
            eventHandlers[eventName] = handlersForType;
        }
        if (handlersForType.indexOf(callback) === -1) {
            handlersForType.push(callback);
        }
    };
    /**
     * Un-register an event listener
     * @param {LookatEventType} eventName
     * @param {LookatEventCallback} callback
     */
    this.off = function (eventName, callback) {
        /** @type {LookatEventCallback[]} */
        var handlersForType = eventHandlers[eventName];
        if (handlersForType) {
            var index = handlersForType.indexOf(callback);
            if (index !== -1) {
                handlersForType.splice(index, 1);
            }
        }
    };
    /**
     * Set the DOFs to be used in the look-at/orient behavior.
     *
     * Commonly-used dof groups are defined in [animate.dofs]{@link jibo.animate.dofs}.
     *
     * @param {DOFSet|string[]} dofNames - names of dofs to use, null for all dofs.
     */
    this.setDOFs = function (dofNames) {
        if (!dofNames) {
            dofNames = allDOFsFullLookat;
        }
        else if (dofNames instanceof DOFSet) {
            dofNames = dofNames.getDOFs();
        }
        var validDOFs = allDOFsFullLookat;
        var newDOFs = [];
        for (var i = 0; i < dofNames.length; i++) {
            if (validDOFs.indexOf(dofNames[i]) > -1) {
                newDOFs.push(dofNames[i]);
            }
        }
        lookPose = new Pose("LookPose", newDOFs);
    };
    /**
     * @return {string[]}
     */
    this.getDOFs = function () {
        return lookPose.getDOFNames().slice(0);
    };
    /**
     * @param {boolean} orientFully
     */
    this.setOrientFully = function (orientFully) {
        shouldOrientFully = orientFully;
    };
    /**
     * @param {boolean} isContinuous
     */
    this.setContinuousMode = function (isContinuous) {
        continuous = isContinuous;
    };
    /**
     * @param {TransitionBuilder} transition
     */
    this.setTransitionIn = function (newTransition) {
        //TODO: cache for instances?
        transition = newTransition;
    };
    /**
     * Get the setting for the overall structure of this lookat's IK.
     * Set all config before first startLookat
     * @return {LookatConfig}
     */
    this.getLookatConfig = function () {
        return lookatConfig;
    };
    /**
     * Set the setting for the overall structure of this lookat's IK.
     * Set all config before first startLookat
     * @param {LookatConfig} newLookatConfig
     */
    this.setLookatConfig = function (newLookatConfig) {
        lookatConfig = newLookatConfig;
    };
    /**
     * Get the config for a single lookat node.  Returned object is not a copy (subsequent modifications will affect this builder) .
     * Set all config before first startLookat
     * @param {string} nodeName
     * @return {LookatNodeRuntimeConfig}
     */
    this.getLookatNodeConfig = function (nodeName) {
        if (!lookatNodeRuntimeConfigs.hasOwnProperty(nodeName)) {
            throw new Error("Cannot get config for unknown node: " + nodeName + " (valid nodes:" + Object.keys(lookatNodeRuntimeConfigs) + ")");
        }
        else {
            return lookatNodeRuntimeConfigs[nodeName];
        }
    };
    /**
     * Set the config for a single lookat node.  Object is not a copied (subsequent modifications will affect this builder).
     * Set all config before first startLookat
     * @param {string} nodeName
     * @param {LookatNodeRuntimeConfig} config
     */
    this.setLookatNodeConfig = function (nodeName, config) {
        if (!lookatNodeRuntimeConfigs.hasOwnProperty(nodeName)) {
            throw new Error("Cannot set config for unknown node: " + nodeName + " (valid nodes:" + Object.keys(lookatNodeRuntimeConfigs) + ")");
        }
        else {
            lookatNodeRuntimeConfigs[nodeName] = config;
        }
    };
    /**
     * Get the config for a single lookat dof.  Returned object is not a copy (subsequent modifications will affect this builder).
     * Set all config before first startLookat
     * @param {string} dofName
     * @return {LookatDOFRuntimeConfig}
     */
    this.getLookatDOFConfig = function (dofName) {
        if (!lookatDOFRuntimeConfigs.hasOwnProperty(dofName)) {
            throw new Error("Cannot get config for unknown DOF: " + dofName + " (valid DOFS:" + Object.keys(lookatDOFRuntimeConfigs) + ")");
        }
        else {
            return lookatDOFRuntimeConfigs[dofName];
        }
    };
    /**
     * Set the config for a single lookat dof.  Object is not a copied (subsequent modifications will affect this builder).
     * Set all config before first startLookat
     * @param {string} dofName
     * @param {LookatDOFRuntimeConfig} config
     */
    this.setLookatDOFConfig = function (dofName, config) {
        if (!lookatDOFRuntimeConfigs.hasOwnProperty(dofName)) {
            throw new Error("Cannot set config for unknown DOF: " + dofName + " (valid DOFS:" + Object.keys(lookatDOFRuntimeConfigs) + ")");
        }
        else {
            lookatDOFRuntimeConfigs[dofName] = config;
        }
    };
    //var createImmediateSuccessHandler = function(lookatInstance){
    //	var hStarted = eventHandlers[LookatEventType.STARTED];
    //	var hStopped = eventHandlers[LookatEventType.STOPPED];
    //	var hTargetReached = eventHandlers[LookatEventType.TARGET_REACHED];
    //	if(hStarted || hStopped || hTargetReached){
    //		var startHandlers = null;
    //		var targetReachedHandlers = null;
    //		var stopHandlers = null;
    //		var i;
    //		if(hStarted) {
    //			startHandlers = hStarted.slice(0);
    //		}
    //		if(hStopped) {
    //			stopHandlers = hStopped.slice(0);
    //		}
    //		if(hTargetReached) {
    //			targetReachedHandlers = hTargetReached.slice(0);
    //		}
    //
    //		return function() {
    //			if(startHandlers){
    //				for(i = 0; i < startHandlers.length; i++){
    //					startHandlers[i](LookatEventType.STARTED, lookatInstance, {});
    //				}
    //			}
    //			if(targetReachedHandlers){
    //				for(i = 0; i < targetReachedHandlers.length; i++){
    //					targetReachedHandlers[i](LookatEventType.TARGET_REACHED, lookatInstance, {});
    //				}
    //			}
    //			if(stopHandlers){
    //				for(i = 0; i < stopHandlers.length; i++){
    //					stopHandlers[i](LookatEventType.STOPPED, lookatInstance, {});
    //				}
    //			}
    //		};
    //	}
    //};
    //map between timeline events and lookat events
    var createStartedHandler = function (lookatInstance) {
        var h = eventHandlers[LookatEventType.STARTED];
        if (globalDelegate || h) {
            var startHandlers = null;
            if (h) {
                startHandlers = h.slice(0);
            }
            return function () {
                if (globalDelegate) {
                    globalDelegate(LookatEventType.STARTED, lookatInstance, {});
                }
                if (startHandlers) {
                    for (var i = 0; i < startHandlers.length; i++) {
                        startHandlers[i](LookatEventType.STARTED, lookatInstance, {});
                    }
                }
            };
        }
        else {
            return null;
        }
    };
    var createTargetReachedHandler = function (lookatInstance) {
        var h = eventHandlers[LookatEventType.TARGET_REACHED];
        if (globalDelegate || h) {
            var reachedHandlers = null;
            if (h) {
                reachedHandlers = h.slice(0);
            }
            return function (target) {
                if (globalDelegate) {
                    globalDelegate(LookatEventType.TARGET_REACHED, lookatInstance, { target: target });
                }
                if (reachedHandlers) {
                    for (var i = 0; i < reachedHandlers.length; i++) {
                        reachedHandlers[i](LookatEventType.TARGET_REACHED, lookatInstance, { target: target });
                    }
                }
            };
        }
        else {
            return null;
        }
    };
    var createTargetSupersededHandler = function (lookatInstance) {
        var h = eventHandlers[LookatEventType.TARGET_SUPERSEDED];
        if (globalDelegate || h) {
            var supersededHandlers = null;
            if (h) {
                supersededHandlers = h.slice(0);
            }
            return function (target) {
                if (globalDelegate) {
                    globalDelegate(LookatEventType.TARGET_SUPERSEDED, lookatInstance, { target: target });
                }
                if (supersededHandlers) {
                    for (var i = 0; i < supersededHandlers.length; i++) {
                        supersededHandlers[i](LookatEventType.TARGET_SUPERSEDED, lookatInstance, { target: target });
                    }
                }
            };
        }
        else {
            return null;
        }
    };
    //map between timeline events and lookat events
    var createStoppedHandler = function (lookatInstance) {
        var hStopped = eventHandlers[LookatEventType.STOPPED];
        if (globalDelegate || hStopped) {
            var stopHandlers = null;
            if (hStopped) {
                stopHandlers = hStopped.slice(0);
            }
            return function (interrupted) {
                if (globalDelegate) {
                    globalDelegate(LookatEventType.STOPPED, lookatInstance, { interrupted: interrupted });
                }
                if (stopHandlers) {
                    for (var i = 0; i < stopHandlers.length; i++) {
                        stopHandlers[i](LookatEventType.STOPPED, lookatInstance, { interrupted: interrupted });
                    }
                }
            };
        }
        else {
            return null;
        }
    };
    //map between timeline events and lookat events
    var createRemovedHandler = function (lookatInstance) {
        var hStopped = eventHandlers[LookatEventType.STOPPED];
        var hCancelled = eventHandlers[LookatEventType.CANCELLED];
        if (globalDelegate || hStopped || hCancelled) {
            var stopHandlers = null;
            var cancelHandlers = null;
            if (hStopped) {
                stopHandlers = hStopped.slice(0);
            }
            if (hCancelled) {
                cancelHandlers = hCancelled.slice(0);
            }
            return function (started, stopped) {
                var i;
                if (globalDelegate) {
                    if (started && !stopped) {
                        globalDelegate(LookatEventType.STOPPED, lookatInstance, { interrupted: true });
                    }
                    if (!started) {
                        globalDelegate(LookatEventType.CANCELLED, lookatInstance, {});
                    }
                }
                if (stopHandlers) {
                    if (started && !stopped) {
                        for (i = 0; i < stopHandlers.length; i++) {
                            stopHandlers[i](LookatEventType.STOPPED, lookatInstance, { interrupted: true });
                        }
                    }
                }
                if (cancelHandlers) {
                    if (!started) {
                        for (i = 0; i < stopHandlers.length; i++) {
                            cancelHandlers[i](LookatEventType.CANCELLED, lookatInstance, {});
                        }
                    }
                }
            };
        }
        else {
            return null;
        }
    };
};
SingleLookatBuilder.LookatDOFGeometryConfig = LookatDOFGeometryConfig;
SingleLookatBuilder.LookatConfig = LookatConfig;
module.exports = SingleLookatBuilder;

},{"../geometry-info/DOFSet":45,"../ifr-core/SLog":57,"../ifr-motion/base/Motion":74,"../ifr-motion/base/Pose":78,"../ifr-motion/lookat/DiskStabilizationTracker":100,"../ifr-motion/lookat/LookatBlinkManager":102,"../ifr-motion/lookat/LookatMotionNode":104,"../ifr-motion/lookat/LookatNode":105,"../ifr-motion/lookat/LookatNodeTargetAdjuster":107,"../ifr-motion/lookat/LookatOrientationStatusReporter":108,"../ifr-motion/lookat/LookatWindupPolicy":109,"../ifr-motion/lookat/MotionLookat":110,"../ifr-motion/lookat/OcularStabilizationTracker":111,"../ifr-motion/lookat/PlaneAlignmentWithRollLookatDOF":112,"../ifr-motion/lookat/PlaneAlignmentWithRollLookatNode":113,"../ifr-motion/lookat/PlaneDisplacementLookatDOF":114,"../ifr-motion/lookat/RotationalLookatDOF":118,"../ifr-motion/lookat/RotationalPlaneAlignmentLookatDOF":119,"../ifr-motion/lookat/WorldTargetAdjuster":120,"../ifr-motion/lookat/trackpolicy/LookatNodeTrackPolicy":121,"../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerAlways":123,"../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerDiscomfort":124,"../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerMovementTerminated":125,"../ifr-motion/lookat/trackpolicy/TrackPolicyTriggerOnOtherNode":126,"./timeline/LookatMultiLayerStatusManager":13,"./timeline/SimpleMotionGenerator":22,"@jibo/three":undefined}],5:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
/**
 * Protected constructor for internal use only.
 *
 * TransitionBuilders are used to generate procedural transitions between animations or
 * static poses that require intermediate motion.
 *
 * TransitionBuilders can be created via the animation module's
 * [createAccelerationTransitionBuilder]{@link jibo.animate#createAccelerationTransitionBuilder} or
 * [createLinearTransitionBuilder]{@link jibo.animate#createLinearTransitionBuilder} methods.
 *
 * @class TransitionBuilder
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var TransitionBuilder = function () { };
/* superclass definition:        */
/* eslint-disable no-unused-vars */
/**
 * Protected method for internal/subclass use only.
 *
 * Generates a procedural transition motion using the configuration specified by this builder.
 * @method jibo.animate.TransitionBuilder#generateTransition
 * @param {Pose} fromPose - Starting pose for the transition.
 * @param {Motion} toMotion - Motion to use as the destination for the transition.
 * @param {number} timeOffsetInTo - Time offset to target in the destination motion.
 * @param {string[]} onDOFs - DOFs to use for the transition.
 *
 * @return {Motion} Procedural transition motion.
 * @protected
 */
TransitionBuilder.prototype.generateTransition = function (fromPose, toMotion, timeOffsetInTo, onDOFs) { };
/**
 * Clones this builder.
 * The returned builder can be safely modified without affecting this source builder.
 * @method jibo.animate.TransitionBuilder#clone
 * @return {jibo.animate.TransitionBuilder} A new TransitionBuilder with identical parameters to the source builder.
 */
TransitionBuilder.prototype.clone = function () { };
module.exports = TransitionBuilder;

},{}],6:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var SampleCombiner = require("./SampleCombiner");
/**
 * @constructor
 * @extends SampleCombiner
 */
var AddSampleCombiner = function () {
    SampleCombiner.call(this);
};
AddSampleCombiner.prototype = Object.create(SampleCombiner.prototype);
AddSampleCombiner.prototype.constructor = AddSampleCombiner;
/**
 * Adds the components of sampleNew to the components of samplePrev
 *
 * @param {number} dofIndex
 * @param {number[]} samplePrev
 * @param {number[]} sampleNew
 * @param {Object.<string, string|number|boolean>} properties
 * @return {number[]}
 * @override
 */
AddSampleCombiner.prototype.combineSamples = function (dofIndex, samplePrev, sampleNew, properties) {
    var r = [];
    for (var i = 0; i < samplePrev.length; i++) {
        if (i < sampleNew.length) {
            r.push(samplePrev[i] + sampleNew[i]);
        }
        else {
            r.push(samplePrev[i]);
        }
    }
    return r;
};
module.exports = AddSampleCombiner;

},{"./SampleCombiner":19}],7:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * Interface for auxiliary output delegates.
 *
 * @class AuxOutputDelegate
 * @private
 */
var AuxOutputDelegate = {};
/* interface definition:        */
/* eslint-disable no-unused-vars */
/**
 * @private
 */
AuxOutputDelegate.prototype = {
    /**
     * Updates the delegate with the latest DOF values.
     *
     * @param {Time} timestamp - Timestamp of the latest DOF calculation.
     * @param {Object.<string, Object>} dofValues - DOF value map.
     * @param {Object} metadata - Rendering metadata/properties.
     */
    display: function (timestamp, dofValues, metadata) { }
};
/* end interface definition:        */
/* eslint-enable no-unused-vars */
/**
 * Auxiliary timeline output for alternative renderers, additional body services, logging/debugging, etc.
 *
 * @param {RobotInfo} robotInfo
 * @param {AuxOutputDelegate} outputDelegate
 * @constructor
 */
var AuxOutput = function (robotInfo, outputDelegate) {
    /** @type {RobotInfo} */
    this.robotInfo = robotInfo;
    /** @type {AuxOutputDelegate} */
    this.outputDelegate = outputDelegate;
    /** @type {string[]} */
    this.dofNames = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames();
    /** @type {Array.<Object.<string, Object>>} */
    this.dofValuesList = [{}, {}];
    /** @type {number} */
    this.tickCount = 0;
};
/**
 * @param {Time} time
 * @param {Pose} pose
 * @param {Object} blackboard
 */
AuxOutput.prototype.handleOutput = function (time, pose, blackboard) {
    /** @type {Object.<string, Object>} */
    var dofValues = this.dofValuesList[this.tickCount % this.dofValuesList.length];
    for (var dofIndex = 0; dofIndex < this.dofNames.length; dofIndex++) {
        var dofValue = pose.getByIndex(dofIndex, 0);
        dofValues[this.dofNames[dofIndex]] = dofValue;
    }
    this.outputDelegate.display(time, dofValues, blackboard);
    this.tickCount++;
};
module.exports = AuxOutput;

},{}],8:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var MotionGenerator = require("./MotionGenerator");
var TimelineEventDispatcher = require("./TimelineEventDispatcher");
/**
 * @param {AnimationUtilities} animUtils
 * @param {string} name
 * @param {jibo.animate.Time} startTime
 * @constructor
 * @extends MotionGenerator
 */
var BaseMotionGenerator = function (animUtils, name, startTime) {
    MotionGenerator.call(this);
    /** @type {AnimationUtilities} */
    this._animUtils = animUtils;
    /** @type {string} */
    this._name = name;
    /** @type {jibo.animate.Time} */
    this._startTime = startTime;
    /** @type {Timeline~ClipStartedHandler} */
    this._clipStartedHandler = null;
    /** @type {Timeline~ClipStoppedHandler} */
    this._clipStoppedHandler = null;
    /** @type {Timeline~ClipRemovedHandler} */
    this._clipRemovedHandler = null;
    /** @type {Timeline~ClipEventHandler} */
    this._clipEventHandler = null;
    var dofCount = this._animUtils.dofIndicesToNames.length;
    /** @type {number[]} */
    this._dofs = null;
    /** @type {boolean[]} */
    this._dofMask = new Array(dofCount).fill(false);
    /** @type {jibo.animate.Time[]} */
    this._dofEndTimes = new Array(dofCount).fill(null);
    /** @type {jibo.animate.Time} */
    this._endTime = null;
    /** @type {boolean} */
    this._entered = false;
    /** @type {boolean} */
    this._exited = false;
    /** @type {boolean} */
    this._interrupted = false;
    /** @type {jibo.animate.Time} */
    this._currentTime = null;
};
BaseMotionGenerator.prototype = Object.create(MotionGenerator.prototype);
BaseMotionGenerator.prototype.constructor = BaseMotionGenerator;
/**
 * @param {string[]} dofNames - include these DOFs
 * @param {jibo.animate.Time} endTime - end time, may be null for no end
 * @protected
 */
BaseMotionGenerator.prototype._initWithDOFNames = function (dofNames, endTime) {
    var dofIndices = new Array(dofNames.length);
    for (var i = 0; i < dofNames.length; i++) {
        dofIndices[i] = this._animUtils.dofNamesToIndices[dofNames[i]];
    }
    this._initWithDOFIndices(dofIndices, endTime);
};
/**
 * @param {number[]} dofIndices - include these DOFs
 * @param {jibo.animate.Time} endTime - end time, may be null for no end
 * @protected
 */
BaseMotionGenerator.prototype._initWithDOFIndices = function (dofIndices, endTime) {
    this._dofs = dofIndices;
    for (var i = 0; i < dofIndices.length; i++) {
        var dofIndex = dofIndices[i];
        this._dofMask[dofIndex] = true;
        this._dofEndTimes[dofIndex] = endTime;
    }
    this._endTime = endTime;
};
/**
 * @param {Timeline~ClipStartedHandler} clipStartedHandler
 * @param {Timeline~ClipStoppedHandler} clipStoppedHandler
 * @param {Timeline~ClipRemovedHandler} clipRemovedHandler
 * @param {Timeline~ClipEventHandler} clipEventHandler
 */
BaseMotionGenerator.prototype.setHandlers = function (clipStartedHandler, clipStoppedHandler, clipRemovedHandler, clipEventHandler) {
    this._clipStartedHandler = clipStartedHandler;
    this._clipStoppedHandler = clipStoppedHandler;
    this._clipRemovedHandler = clipRemovedHandler;
    this._clipEventHandler = clipEventHandler;
};
/**
 * @returns {string}
 * @override
 */
BaseMotionGenerator.prototype.getName = function () {
    return this._name;
};
/**
 * @returns {jibo.animate.Time}
 * @override
 */
BaseMotionGenerator.prototype.getStartTime = function () {
    return this._startTime;
};
/**
 * Returns true if this generator ends after the given time.
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @override
 */
BaseMotionGenerator.prototype.endsAfter = function (time) {
    return this._endTime === null || this._endTime.isGreater(time);
};
/**
 * Returns false if this generator has data for any DOF, true otherwise.
 * @returns {boolean}
 * @override
 */
BaseMotionGenerator.prototype.isEmpty = function () {
    return this._dofs.length === 0 || !this.endsAfter(this._startTime);
};
/**
 * Returns true if this generator has data for the specified DOF past the given time.
 * @param {number} dofIndex
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @override
 */
BaseMotionGenerator.prototype.dofEndsAfter = function (dofIndex, time) {
    if (this._dofMask[dofIndex]) {
        var endTime = this._dofEndTimes[dofIndex];
        return endTime === null || endTime.isGreater(time);
    }
    else {
        return false;
    }
};
/**
 * Force this motion to end the specified tracks at or before cropTime.  If a track
 * already ends before cropTime it is unchanged.  If a track starts after
 * cropTime it is completely removed.
 *
 * @param {jibo.animate.Time} cropTime - crop to end at this time if necessary
 * @param {number[]} dofIndices - crop tracks for these dofs
 * @override
 */
BaseMotionGenerator.prototype.cropEnd = function (cropTime, dofIndices) {
    var didCrop = false;
    var i, dofIndex;
    var endTime;
    if (cropTime.isGreater(this._startTime)) {
        // update end times for affected DOFs
        for (i = 0; i < dofIndices.length; i++) {
            dofIndex = dofIndices[i];
            if (this._dofMask[dofIndex]) {
                endTime = this._dofEndTimes[dofIndex];
                if (endTime === null || endTime.isGreater(cropTime)) {
                    this._dofEndTimes[dofIndex] = cropTime;
                    didCrop = true;
                }
            }
        }
    }
    else {
        // fully remove affected DOFs
        for (i = 0; i < dofIndices.length; i++) {
            dofIndex = dofIndices[i];
            if (this._dofMask[dofIndex]) {
                this._dofMask[dofIndex] = false;
                didCrop = true;
            }
        }
    }
    if (didCrop) {
        // recalculate our end time
        var newEndTime = this._startTime;
        for (i = 0; i < this._dofs.length; i++) {
            dofIndex = this._dofs[i];
            if (this._dofMask[dofIndex]) {
                endTime = this._dofEndTimes[dofIndex];
                if (endTime === null) {
                    // at least one DOF has no end, so we have no end
                    newEndTime = null;
                    break;
                }
                else if (endTime.isGreater(newEndTime)) {
                    newEndTime = endTime;
                }
            }
        }
        // check to see if we have been interrupted as a result of this cropping
        if (newEndTime !== null) {
            if (this._endTime === null || this._endTime.isGreater(newEndTime)) {
                this._interrupted = true;
            }
        }
        this._endTime = newEndTime;
    }
};
/**
 * get all DOFs that are involved in this motion
 *
 * @returns {number[]}
 * @override
 */
BaseMotionGenerator.prototype.getDOFIndices = function () {
    return this._dofs;
};
/**
 * @param {jibo.animate.Time} currentTime
 * @override
 */
BaseMotionGenerator.prototype.notifyUpdateStarted = function (currentTime) {
    this._currentTime = currentTime;
};
/**
 * @param {jibo.animate.Time} currentTime
 * @override
 */
BaseMotionGenerator.prototype.notifyUpdateFinished = function (currentTime) {
    if (!this._entered && currentTime.isGreaterOrEqual(this._startTime)) {
        this._entered = true;
        if (this._clipStartedHandler) {
            TimelineEventDispatcher.queueEvent(this._clipStartedHandler, []);
        }
    }
    if (this._entered && !this._exited) {
        this.queueCustomEvents();
    }
    if (this._entered && !this._exited && !this.endsAfter(currentTime)) {
        this._exited = true;
        if (this._clipStoppedHandler) {
            TimelineEventDispatcher.queueEvent(this._clipStoppedHandler, [this._interrupted]);
        }
    }
};
/**
 * @override
 */
BaseMotionGenerator.prototype.notifyRemoved = function () {
    if (this._clipRemovedHandler) {
        TimelineEventDispatcher.queueEvent(this._clipRemovedHandler, [this._entered, this._exited]);
    }
};
/**
 * @virtual
 */
BaseMotionGenerator.prototype.queueCustomEvents = function () {
};
module.exports = BaseMotionGenerator;

},{"./MotionGenerator":16,"./TimelineEventDispatcher":23}],9:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * @constructor
 */
var LayerCombiner = function () {
};
/* superclass definition:        */
/* eslint-disable no-unused-vars */
/**
 * @param {number[]} layerIndices
 * @param {LayerState[]} layerStates
 * @returns {LayerState}
 * @abstract
 */
LayerCombiner.prototype.combineLayers = function (layerIndices, layerStates) {
};
/**
 * @param {LayerState} combinedState
 * @param {number} layerIndex
 * @param {LayerState} layerState
 * @param {number} dofIndex
 * @abstract
 */
LayerCombiner.prototype.incrementState = function (combinedState, layerIndex, layerState, dofIndex) {
};
/* end superclass definition:    */
/* eslint-enable no-unused-vars */
LayerCombiner.getSkipLayerProperty = function (layerName) {
    return "skip_layer:" + layerName;
};
module.exports = LayerCombiner;

},{}],10:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * @param {jibo.animate.Time} time
 * @param {Pose} pose
 * @constructor
 */
var LayerState = function (time, pose) {
    /**
     * @return {jibo.animate.Time}
     */
    this.getTime = function () {
        return time;
    };
    /**
     * @param {jibo.animate.Time} newTime
     */
    this.setTime = function (newTime) {
        time = newTime;
    };
    /**
     * @return {Pose}
     */
    this.getPose = function () {
        return pose;
    };
    /**
     * @return {Array.<string>}
     */
    this.getDOFNames = function () {
        return pose.getDOFNames();
    };
    /**
     * @param {string} dofName
     * @return {number[]}
     */
    this.getDOFState = function (dofName) {
        return pose.get(dofName);
    };
    /**
     * @param {number} dofIndex
     * @return {number[]}
     */
    this.getDOFStateByIndex = function (dofIndex) {
        return pose.getByIndex(dofIndex);
    };
    /**
     * @param {string} dofName
     * @param {number[]} dofState
     */
    this.setDOFState = function (dofName, dofState) {
        pose.set(dofName, dofState);
    };
    /**
     * @param {number} dofIndex
     * @param {number[]} dofState
     */
    this.setDOFStateByIndex = function (dofIndex, dofState) {
        pose.setByIndex(dofIndex, dofState);
    };
    /**
     * @param {jibo.animate.Time} [newTime]
     * @return {LayerState}
     */
    this.getCopy = function (newTime) {
        if (newTime === null || newTime === undefined) {
            newTime = time;
        }
        return new LayerState(newTime, pose.getCopy());
    };
};
module.exports = LayerState;

},{}],11:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BaseMotionGenerator = require("./BaseMotionGenerator");
var Motion = require("../../ifr-motion/base/Motion");
var Pose = require("../../ifr-motion/base/Pose");
var slog = require("../../ifr-core/SLog");
/**
 * @description Enum of blending modes.
 * @enum {string}
 * @property {string} ABSOLUTE - DOF value is absolute (no blending).
 * @property {string} RELATIVE_TO_CURRENT - DOF value is relative to current heading.
 * @property {string} RELATIVE_TO_TARGET - DOF value is relative to target heading.
 */
var BlendMode = {
    ABSOLUTE: "ABSOLUTE",
    RELATIVE_TO_CURRENT: "RELATIVE_TO_CURRENT",
    RELATIVE_TO_TARGET: "RELATIVE_TO_TARGET"
};
/**
 * @param {AnimationUtilities} animUtils
 * @param {jibo.animate.Time} startTime
 * @constructor
 * @extends BaseMotionGenerator
 */
var LookatBlendGenerator = function (animUtils, startTime) {
    BaseMotionGenerator.call(this, animUtils, "lookat blend generator", startTime);
    this._initWithDOFNames(animUtils.dofs.BASE.getDOFs(), null);
    /** @type {MotionTimeline} */
    this._timeline = animUtils.timeline;
    /** @type {string} */
    this._baseDOFName = animUtils.dofs.BASE.getDOFs()[0];
    /** @type {InterpolatorSet} */
    this._interpolatorSet = animUtils.robotInfo.getKinematicInfo().getInterpolatorSet();
    /** @type {number} */
    this._currentBaseHeading = 0;
    /** @type {number} */
    this._targetBaseHeading = 0;
    /** @type {BlendMode} */
    this._currentBaseBlendMode = BlendMode.ABSOLUTE;
};
LookatBlendGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
LookatBlendGenerator.prototype.constructor = LookatBlendGenerator;
/**
 * @param {string} layer
 * @param {Motion} toMotion - Motion to use as the destination for the transition.
 * @param {number} timeOffsetInTo - Time offset to target in the destination motion.
 * @param {string[]} onDOFs - DOFs to use for the transition.
 * @param {jibo.animate.TransitionBuilder} transition
 * @param {BlendMode} blendMode
 * @returns {Motion}
 */
LookatBlendGenerator.prototype.generateTransition = function (layer, toMotion, timeOffsetInTo, onDOFs, transition, blendMode) {
    /** @type {Pose} */
    var currentPose;
    /** @type {Motion} */
    var transitionMotion;
    if (layer === "default" && onDOFs.indexOf(this._baseDOFName) !== -1) {
        currentPose = this._timeline.getCurrentState(["default", "lookat"]).getPose();
        /** @type {Pose} */
        var targetPose = new Pose("target sample", onDOFs);
        toMotion.getPoseAtTime(timeOffsetInTo, this._interpolatorSet, targetPose);
        var valueToAdd;
        if (blendMode === BlendMode.RELATIVE_TO_CURRENT) {
            valueToAdd = this._currentBaseHeading;
        }
        else if (blendMode === BlendMode.RELATIVE_TO_TARGET) {
            valueToAdd = this._targetBaseHeading;
        }
        else {
            // absolute
            valueToAdd = 0;
        }
        targetPose.set(this._baseDOFName, targetPose.get(this._baseDOFName, 0) + valueToAdd, 0);
        var targetMotion = Motion.createFromPose(toMotion.getName() + " blended sample", targetPose, 1);
        transitionMotion = transition.generateTransition(currentPose, targetMotion, 0, onDOFs);
    }
    else {
        currentPose = this._timeline.getCurrentState([layer]).getPose();
        transitionMotion = transition.generateTransition(currentPose, toMotion, timeOffsetInTo, onDOFs);
    }
    return transitionMotion;
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @override
 */
LookatBlendGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    // check blackboard for base blend mode
    var baseBlendMode = blackboard.baseBlendMode;
    if (baseBlendMode !== undefined && baseBlendMode !== null) {
        this._currentBaseBlendMode = baseBlendMode;
    }
    // check blackboard for lookat info
    var lookatInfo = blackboard.lookatInfo;
    if (lookatInfo !== undefined && lookatInfo !== null) {
        var currentHeading = lookatInfo.bottomSection_r.iForwardCur;
        if (currentHeading !== undefined && currentHeading !== null) {
            if (Number.isFinite(currentHeading)) {
                this._currentBaseHeading = currentHeading;
            }
            else {
                slog.warn("LookatBlendGenerator: got non-finite value for current heading: (" + currentHeading + ")");
            }
        }
        var targetHeading = lookatInfo.bottomSection_r.iForwardTarg;
        if (targetHeading !== undefined && targetHeading !== null) {
            if (Number.isFinite(targetHeading)) {
                this._targetBaseHeading = targetHeading;
                if (lookatInfo.bottomSection_r.AtTarget) {
                    this._currentBaseHeading = targetHeading;
                }
            }
            else {
                slog.warn("LookatBlendGenerator: got non-finite value for target heading: (" + targetHeading + ")");
            }
        }
    }
    var valueToAdd;
    if (this._currentBaseBlendMode === BlendMode.RELATIVE_TO_CURRENT) {
        valueToAdd = this._currentBaseHeading;
    }
    else if (this._currentBaseBlendMode === BlendMode.RELATIVE_TO_TARGET) {
        valueToAdd = this._targetBaseHeading;
    }
    else {
        // absolute
        valueToAdd = 0;
    }
    return [valueToAdd];
};
/**
 * @override
 */
LookatBlendGenerator.prototype.notifyRemoved = function () {
    throw new Error("LookatBlendGenerator removed from timeline; something has been added to the lookat layer in error!");
};
LookatBlendGenerator.BlendMode = BlendMode;
module.exports = LookatBlendGenerator;

},{"../../ifr-core/SLog":57,"../../ifr-motion/base/Motion":74,"../../ifr-motion/base/Pose":78,"./BaseMotionGenerator":8}],12:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var BaseMotionGenerator = require("./BaseMotionGenerator");
var LookatBlendGenerator = require("./LookatBlendGenerator");
var Pose = require("../../ifr-motion/base/Pose");
var slog = require("../../ifr-core/SLog");
var channel = "LOOKAT";
/**
 * @param {AnimationUtilities} animUtils
 * @param {MotionLookat} motionLookat
 * @param {jibo.animate.Time} startTime
 * @param {THREE.Vector3} target
 * @param {string[]} [onDOFs=null] - use only these dofs (all dofs of motionLookat used if omitted/null)
 * @param {LookatMultiLayerStatusManager} multiLayerLookatStatus - handle statekeeping here to allow for multiple generators per lookat
 * @param {LookatOrientationStatusReporter} statusReporter
 * @constructor
 * @extends BaseMotionGenerator
 */
var LookatMotionGenerator = function (animUtils, motionLookat, startTime, target, onDOFs, multiLayerLookatStatus, statusReporter) {
    var useDOFs;
    var fullLookatDOFs = motionLookat.getDOFs();
    if (onDOFs != null) {
        useDOFs = [];
        for (var i = 0; i < onDOFs.length; i++) {
            if (fullLookatDOFs.indexOf(onDOFs[i]) >= 0) {
                useDOFs.push(onDOFs[i]);
            }
            else {
                slog(channel, "Rejecting dof " + onDOFs[i] + " from lookat set as it is covered by no lookat nodes");
            }
        }
    }
    else {
        useDOFs = fullLookatDOFs;
    }
    BaseMotionGenerator.call(this, animUtils, "SingleLookGenerator", startTime);
    this._initWithDOFNames(useDOFs, null);
    /** @type {MotionLookat} */
    this._motionLookat = motionLookat; //TODO: we assume that motion lookat is reset and primed with current state
    /** @type {THREE.Vector3} */
    this._target = target.clone();
    /** @type {Pose} */
    this._generatedPose = new Pose("LMG generated pose", fullLookatDOFs);
    /**
     * pose frozen after particular dofs roll off the end
     * @type {Pose} */
    this._frozenPose = new Pose("LMG frozen pose", useDOFs);
    this._motionLookat.getPose(this._frozenPose);
    /** @type {LookatMultiLayerStatusManager} */
    this._multiLayerLookatStatus = multiLayerLookatStatus;
    /** @type {LookatOrientationStatusReporter} */
    this._statusReporter = statusReporter || null;
};
LookatMotionGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
LookatMotionGenerator.prototype.constructor = LookatMotionGenerator;
/**
 *
 * @param {THREE.Vector3} target
 */
LookatMotionGenerator.prototype.setTarget = function (target) {
    this._target.copy(target);
};
/**
 *
 * @param {jibo.animate.Time} currentTime
 * @override
 */
LookatMotionGenerator.prototype.notifyUpdateFinished = function (currentTime) {
    if (currentTime.isGreaterOrEqual(this._startTime)) {
        var shouldEndNow = this._multiLayerLookatStatus.handleUpdateFinishedForGenerator(this, currentTime);
        if (shouldEndNow) {
            this.cropEnd(currentTime, this.getDOFIndices());
            this._interrupted = false;
        }
    }
    BaseMotionGenerator.prototype.notifyUpdateFinished.call(this, currentTime);
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @override
 */
LookatMotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    var endTime = this._dofEndTimes[dofIndex];
    var val = null;
    if (endTime === null || endTime.isGreater(this._currentTime)) {
        this._motionLookat.generatePoseIncremental(partialRender.getPose(), this._generatedPose, this._target, this._currentTime, dofIndex);
        val = this._generatedPose.getByIndex(dofIndex);
        if (val !== null) {
            this._frozenPose.setByIndex(dofIndex, val);
        }
    }
    else {
        val = this._frozenPose.getByIndex(dofIndex);
    }
    if (val !== null && this._statusReporter !== null && this._statusReporter.shouldReportOnIndex(dofIndex)) {
        blackboard.baseBlendMode = LookatBlendGenerator.BlendMode.ABSOLUTE; //TODO: possibly make the relationship of this to base more clear/documented
        blackboard.lookatInfo = this._statusReporter.generateStatus(this._motionLookat);
    }
    return val != null ? val.slice(0) : null;
};
module.exports = LookatMotionGenerator;

},{"../../ifr-core/SLog":57,"../../ifr-motion/base/Pose":78,"./BaseMotionGenerator":8,"./LookatBlendGenerator":11}],13:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var LookatMotionGenerator = require("./LookatMotionGenerator");
var TimelineEventDispatcher = require("./TimelineEventDispatcher");
var channel = "LOOKAT";
/**
 * @param {LookatMotionGenerator} generator
 * @constructor
 */
var LayerStatus = function (generator) {
    this.generator = generator;
    this.layerHasStarted = false;
    this.layerHasStopped = false;
    this.layerHasRemoved = false;
};
/**
 * @param {AnimationUtilities} animUtils
 * @param {MotionLookat} lookat
 * @param {jibo.animate.Time} startTime
 * @param {THREE.Vector3} target
 * @param {boolean} continuous
 * @param {LookatOrientationStatusReporter} orientationReporter
 * @constructor
 */
var LookatMultiLayerStatusManager = function (animUtils, lookat, startTime, target, continuous, orientationReporter) {
    /** @type {AnimationUtilities} */
    this._animUtils = animUtils;
    /** @type {Map<LookatMotionGenerator,LayerStatus>} */
    this._layerStatuses = new Map();
    this._clipStartedHandler = null;
    this._clipStoppedHandler = null;
    this._clipRemovedHandler = null;
    this._targetReachedHandler = null;
    this._targetSupersededHandler = null;
    /** @type {THREE.Vector3} */
    this._waitingToNotifyOnTarget = null;
    /** @type {MotionLookat} */
    this._lookat = lookat;
    /** @type {jibo.animate.Time} */
    this._startTime = startTime;
    /** @type {THREE.Vector3} */
    this._target = null;
    /** @type {boolean} */
    this._continuous = continuous;
    /** @type {LookatOrientationStatusReporter} */
    this._orientationReporter = orientationReporter;
    /** @type {boolean} */
    this._haveSentStart = false;
    var dofCount = this._animUtils.dofIndicesToNames.length;
    /**
     * This is an array of booleans (active) indexed by global DOF index
     * @type {boolean[]}
     */
    this._activeDOFMask = new Array(dofCount).fill(false);
    this.setTarget(target);
};
/**
 * Create generator to render nodes on a particular layer with the provided dofs.
 *
 * @param {string[] }dofNames
 * @return {LookatMotionGenerator}
 */
LookatMultiLayerStatusManager.prototype.createGenerator = function (dofNames) {
    var gen = new LookatMotionGenerator(this._animUtils, this._lookat, this._startTime, this._target, dofNames, this, this._orientationReporter);
    this._layerStatuses.set(gen, new LayerStatus(gen));
    //set that generator's events to come back to us for filtering/passing on to eventual listeners
    gen.setHandlers(this.handleStarted.bind(this, gen), this.handleStopped.bind(this, gen), this.handleRemoved.bind(this, gen), null);
    return gen;
};
LookatMultiLayerStatusManager.prototype.setHandlers = function (clipStartedHandler, clipStoppedHandler, clipRemovedHandler, targetReachedHandler, targetSupersededHandler) {
    this._clipStartedHandler = clipStartedHandler;
    this._clipStoppedHandler = clipStoppedHandler;
    this._clipRemovedHandler = clipRemovedHandler;
    this._targetReachedHandler = targetReachedHandler;
    this._targetSupersededHandler = targetSupersededHandler;
};
/**
 *
 * @param {THREE.Vector3} newTarget
 */
LookatMultiLayerStatusManager.prototype.setTarget = function (newTarget) {
    var iter = this._layerStatuses.keys(); //removing for of for optimizer
    var nextVal;
    while (!(nextVal = iter.next()).done) {
        nextVal.value.setTarget(newTarget);
        //this._layerStatuses.get(gen)._targetReached = false;
    }
    if (this._waitingToNotifyOnTarget != null && this._targetSupersededHandler != null) {
        TimelineEventDispatcher.queueEvent(this._targetSupersededHandler, [this._waitingToNotifyOnTarget]);
    }
    this._waitingToNotifyOnTarget = newTarget.clone();
    this._target = this._waitingToNotifyOnTarget;
};
/**
 *
 * @param {LookatMotionGenerator} generator
 * @param {jibo.animate.Time} currentTime
 * @return {boolean} true if generator should truncate to current time (end now naturally)
 */
LookatMultiLayerStatusManager.prototype.handleUpdateFinishedForGenerator = function (generator, currentTime) {
    //first check if we can skip this whole check;
    //if we are continuous and not waiting to notify on a target, we don't need to know, we won't truncate
    if (this._continuous && this._waitingToNotifyOnTarget === null) {
        return false;
    }
    var iter = this._layerStatuses.keys(); //removing for of for optimizer
    var nextVal;
    while (!(nextVal = iter.next()).done) {
        var gen = nextVal.value;
        var dofIndices = gen.getDOFIndices();
        for (var i = 0; i < dofIndices.length; i++) {
            this._activeDOFMask[dofIndices[i]] = gen.dofEndsAfter(dofIndices[i], currentTime);
        }
    }
    /** @type {boolean} */
    var reachedTarget = this._lookat.getHoldReached(this._activeDOFMask);
    if (reachedTarget && this._waitingToNotifyOnTarget != null) {
        //reachedTarget is actually a global state, across all layers.
        //so, we can safely notify now, don't need all layers to report this status
        if (this._targetReachedHandler != null) {
            TimelineEventDispatcher.queueEvent(this._targetReachedHandler, [this._waitingToNotifyOnTarget]);
        }
        this._waitingToNotifyOnTarget = null;
    }
    if (reachedTarget && !this._continuous) {
        return true;
    }
    else {
        return false;
    }
};
/**
 * Returns the indices of all DOFs with motion data past the given time.
 * @param {jibo.animate.Time} time - The query time.
 * @return {number[]} - A list of active DOF indices.
 */
LookatMultiLayerStatusManager.prototype.getActiveDOFIndices = function (time) {
    var activeDOFIndices = [];
    var iter = this._layerStatuses.keys();
    var nextVal;
    while (!(nextVal = iter.next()).done) {
        var gen = nextVal.value;
        var dofIndices = gen.getDOFIndices();
        for (var i = 0; i < dofIndices.length; i++) {
            if (gen.dofEndsAfter(dofIndices[i], time)) {
                activeDOFIndices.push(dofIndices[i]);
            }
        }
    }
    return activeDOFIndices;
};
/**
 * Called by each generator when they start.  We will pass through 1 started when
 * at least one has started and all have been either started or removed.
 */
LookatMultiLayerStatusManager.prototype.handleStarted = function (generator) {
    var genStatus = this._layerStatuses.get(generator);
    genStatus.layerHasStarted = true;
    if (this._clipStartedHandler) {
        var allStartedOrRemoved = true;
        for (var genStatusI of this._layerStatuses.values()) {
            if (!(genStatusI.layerHasStarted || genStatusI.layerHasRemoved)) {
                allStartedOrRemoved = false;
            }
        }
        if (allStartedOrRemoved) {
            TimelineEventDispatcher.queueEvent(this._clipStartedHandler, []);
            this._haveSentStart = true;
        }
    }
};
/**
 * Called by each generator when/if they stopped
 *
 * Each clip will be either removed exactly once and stopped at most once.  We will
 * pass through a single stop if it comes in on the last active (not stopped or removed) layer.
 *
 * @param {LookatMotionGenerator} generator - the generator sending this event
 * @param {boolean} interrupted
 */
LookatMultiLayerStatusManager.prototype.handleStopped = function (generator, interrupted) {
    var genStatus = this._layerStatuses.get(generator);
    if (genStatus.layerHasStopped) {
        slog(channel, "LookatMultiLayerStatManager: getting stop event for stopped layer " + generator);
    }
    genStatus.layerHasStopped = true;
    if (this._clipStoppedHandler) {
        var allFinished = true;
        for (var genStatusI of this._layerStatuses.values()) {
            if (!(genStatusI.layerHasStopped || genStatusI.layerHasRemoved)) {
                allFinished = false;
            }
        }
        if (allFinished) {
            TimelineEventDispatcher.queueEvent(this._clipStoppedHandler, [interrupted]);
        }
    }
};
/**
 * Called by each generator when/if they are removed.
 *
 * Each clip will be either removed exactly once and stopped at most once.  We will
 * pass through a single "remove" when all have been removed.
 *
 * @param {LookatMotionGenerator} generator - the generator sending this event
 * @param {boolean} started
 * @param {boolean} stopped
 */
LookatMultiLayerStatusManager.prototype.handleRemoved = function (generator, started, stopped) {
    var genStatus = this._layerStatuses.get(generator);
    genStatus.layerHasRemoved = true;
    var genStatusI = null;
    //check if we need to start, which could happen if one layer already started then a second layer
    //removes without starting
    if (!this._haveSentStart && this._clipStartedHandler) {
        //should send start if there will be no more starts and we have started at least once
        //all clips removed or started
        var noMoreStartsRemain = true;
        for (genStatusI of this._layerStatuses.values()) {
            if (!(genStatusI.layerHasRemoved || genStatusI.layerHasStarted)) {
                noMoreStartsRemain = false;
            }
        }
        if (noMoreStartsRemain) {
            TimelineEventDispatcher.queueEvent(this._clipStartedHandler, []);
            this._haveSentStart = true;
        }
    }
    if (this._clipRemovedHandler) {
        var allRemoved = true;
        for (genStatusI of this._layerStatuses.values()) {
            if (!genStatusI.layerHasRemoved) {
                allRemoved = false;
            }
        }
        if (allRemoved) {
            TimelineEventDispatcher.queueEvent(this._clipRemovedHandler, [started, stopped]);
        }
    }
};
module.exports = LookatMultiLayerStatusManager;

},{"../../ifr-core/SLog":57,"./LookatMotionGenerator":12,"./TimelineEventDispatcher":23}],14:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
//var MotionValidator = require("../../ifr-motion/base/MotionValidator");
var BaseMotionGenerator = require("./BaseMotionGenerator");
var TimelineEventDispatcher = require("./TimelineEventDispatcher");
/**
 * @param {AnimationUtilities} animUtils
 * @param {Motion[]} motionList
 * @param {RelativeTimeClip[]} clipList
 * @param {number} numLoops - number of times to loop through the motion list, 0 to loop forever
 * @param {jibo.animate.Time} startTime
 * @param {RobotInfo} robotInfo
 * @param {string[]} [dofNames]
 * @constructor
 * @extends BaseMotionGenerator
 */
var LoopedMotionGenerator = function (animUtils, motionList, clipList, numLoops, startTime, robotInfo, dofNames) {
    if (!motionList) {
        throw new Error("tried to construct LoopedMotionGenerator with empty motion list");
    }
    if (numLoops < 0) {
        throw new Error("numLoops value is negative: " + numLoops);
    }
    BaseMotionGenerator.call(this, animUtils, motionList[0].getName(), startTime);
    if (dofNames === null || dofNames === undefined) {
        dofNames = motionList[0].getDOFs();
    }
    // check that all of the motions in the list have all of the dofs
    //for (m=0; m<motionList.length; m++)
    //{
    //	for (i=0; i<dofNames.length; i++)
    //	{
    //		if (!motionList[m].hasDOF(dofNames[i]))
    //		{
    //			throw new Error("LoopedMotionGenerator: motion "+m+" doesn't have a track for required DOF: "+dofNames[i]);
    //		}
    //	}
    //}
    var m;
    /** @type {number[]} */
    this._durationList = [];
    // calculate motion durations
    for (m = 0; m < motionList.length; m++) {
        this._durationList.push(clipList[m].getDuration());
    }
    /** @type {number} */
    this._loopDuration = 0;
    for (m = 0; m < motionList.length; m++) {
        this._loopDuration = this._loopDuration + this._durationList[m];
    }
    var endTime;
    if (numLoops === 0) {
        // loop forever
        endTime = null;
    }
    else {
        var duration = this._loopDuration * numLoops;
        endTime = startTime.add(duration);
    }
    this._initWithDOFNames(dofNames, endTime);
    //TODO: enable MotionValidator via DEBUG flag
    //for (m=0; m<motionList.length; m++)
    //{
    //	MotionValidator.valuesExist(motionList[m], dofNames);
    //}
    /** @type {RelativeTimeClip[]} */
    this._clipList = clipList;
    /** @type {InterpolatorSet} */
    var interpolatorSet = robotInfo.getKinematicInfo().getInterpolatorSet();
    var dofCount = this._dofMask.length;
    /** @type {string[]} */
    this._nameList = [];
    /** @type {Array.<MotionTrack[]>} */
    this._motionTracksList = [];
    /** @type {Interpolators.BaseInterpolator[]} */
    this._interpolators = new Array(dofCount).fill(null);
    for (m = 0; m < motionList.length; m++) {
        this._nameList.push(motionList[m].getName());
        this._motionTracksList.push(new Array(dofCount).fill(null));
    }
    for (var i = 0; i < dofNames.length; i++) {
        var dofIndex = this._dofs[i];
        var dofName = dofNames[i];
        this._interpolators[dofIndex] = interpolatorSet.getInterpolator(dofName);
        for (m = 0; m < motionList.length; m++) {
            this._motionTracksList[m][dofIndex] = motionList[m].getTracks()[dofName];
        }
    }
    /** @type {number} */
    this._numLoops = numLoops;
    /** @type {MotionEventIterator[]} */
    this._customEvents = null;
    /** @type {number} */
    this._eventLoopIndex = 0;
    /** @type {boolean[]} */
    this._sourceTimeReportingFlags = null;
    /** @type {number} */
    this._baseDOFIndex = this._animUtils.dofNamesToIndices[this._animUtils.dofs.BASE.getDOFs()[0]];
    /** @type {BlendMode} */
    this._baseBlendMode = null;
};
LoopedMotionGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
LoopedMotionGenerator.prototype.constructor = LoopedMotionGenerator;
/**
 * @param {MotionEventIterator[]} motionEventsList
 */
LoopedMotionGenerator.prototype.setEvents = function (motionEventsList) {
    if (motionEventsList.length !== this._durationList.length) {
        throw new Error("motionEventsList length " + motionEventsList.length + " doesn't match motionList length " + this._durationList.length);
    }
    this._customEvents = motionEventsList;
};
/**
 * @param {boolean[]} enabledFlags
 */
LoopedMotionGenerator.prototype.setSourceTimeReportingEnabled = function (enabledFlags) {
    if (enabledFlags.length !== this._durationList.length) {
        throw new Error("enabledFlags length " + enabledFlags.length + " doesn't match motionList length " + this._durationList.length);
    }
    this._sourceTimeReportingFlags = enabledFlags;
};
/**
 * @param {BlendMode} blendMode
 */
LoopedMotionGenerator.prototype.setBaseBlendMode = function (blendMode) {
    this._baseBlendMode = blendMode;
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @override
 */
LoopedMotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    var time = this._currentTime;
    var endTime = this._dofEndTimes[dofIndex];
    if (endTime !== null && time.isGreater(endTime)) {
        time = endTime;
    }
    var sampleTime = time.subtract(this._startTime);
    sampleTime = Math.max(sampleTime, 0);
    var loopIndex = Math.floor(sampleTime / this._loopDuration);
    if (this._numLoops !== 0) {
        loopIndex = Math.min(loopIndex, this._numLoops - 1);
    }
    var loopTime = sampleTime - (this._loopDuration * loopIndex);
    var motionIndex = 0;
    var motionTime = loopTime;
    while (motionIndex < this._durationList.length - 1 && motionTime > this._durationList[motionIndex]) {
        motionTime = motionTime - this._durationList[motionIndex];
        motionIndex++;
    }
    var sourceMotionTime = this._clipList[motionIndex].getSourceTime(motionTime);
    var sample = this._motionTracksList[motionIndex][dofIndex].getDataAtTime(sourceMotionTime, this._interpolators[dofIndex]);
    if (this._sourceTimeReportingFlags && this._sourceTimeReportingFlags[motionIndex]) {
        if (!blackboard.sourceTimes) {
            blackboard.sourceTimes = {};
        }
        blackboard.sourceTimes[this._nameList[motionIndex]] = sourceMotionTime;
    }
    if (this._baseBlendMode !== null && dofIndex === this._baseDOFIndex) {
        blackboard.baseBlendMode = this._baseBlendMode;
    }
    return sample;
};
/**
 * @override
 */
LoopedMotionGenerator.prototype.queueCustomEvents = function () {
    if (this._clipEventHandler && this._customEvents) {
        var time = this._currentTime;
        if (this._endTime !== null && time.isGreater(this._endTime)) {
            time = this._endTime;
        }
        var sampleTime = time.subtract(this._startTime);
        sampleTime = Math.max(sampleTime, 0);
        var loopIndex = Math.floor(sampleTime / this._loopDuration);
        if (this._numLoops !== 0) {
            loopIndex = Math.min(loopIndex, this._numLoops - 1);
        }
        // iterate up through any loops we've completed
        while (this._eventLoopIndex < loopIndex) {
            var m;
            for (m = 0; m < this._customEvents.length; m++) {
                while (this._customEvents[m].hasNext(this._durationList[m])) {
                    TimelineEventDispatcher.queueEvent(this._clipEventHandler, [this._customEvents[m].next(this._durationList[m])]);
                }
                this._customEvents[m].reset();
            }
            this._eventLoopIndex++;
        }
        var loopTime = sampleTime - (this._loopDuration * loopIndex);
        // iterate up through loopTime for the current loop
        var motionIndex = 0;
        var motionTime = loopTime;
        while (motionIndex < this._customEvents.length && motionTime >= 0) {
            while (this._customEvents[motionIndex].hasNext(motionTime)) {
                TimelineEventDispatcher.queueEvent(this._clipEventHandler, [this._customEvents[motionIndex].next(motionTime)]);
            }
            motionTime = motionTime - this._durationList[motionIndex];
            motionIndex++;
        }
    }
};
module.exports = LoopedMotionGenerator;

},{"./BaseMotionGenerator":8,"./TimelineEventDispatcher":23}],15:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var SampleCombiner = require("./SampleCombiner");
/**
 * @param {RobotInfo} robotInfo
 *
 * @constructor
 * @extends SampleCombiner
 */
var MixedSampleCombiner = function (robotInfo) {
    SampleCombiner.call(this);
    var dofCount = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames().length;
    /** @type {Object.<string, number>} */
    this._dofNamesToIndices = robotInfo.getKinematicInfo().getDefaultPose().getDOFNamesToIndices();
    /** @type {SampleCombiner[]} */
    this._combinerList = new Array(dofCount).fill(null);
};
MixedSampleCombiner.prototype = Object.create(SampleCombiner.prototype);
MixedSampleCombiner.prototype.constructor = MixedSampleCombiner;
/**
 * Sets which combiner to use for the specified DOFs.
 *
 * @param {string[]} dofNames
 * @param {SampleCombiner} combiner
 */
MixedSampleCombiner.prototype.addCombiner = function (dofNames, combiner) {
    for (var i = 0; i < dofNames.length; i++) {
        this._combinerList[this._dofNamesToIndices[dofNames[i]]] = combiner;
    }
};
/**
 * Combines samples using whichever combiner is specified for the given DOF.
 *
 * @param {number} dofIndex
 * @param {number[]} samplePrev
 * @param {number[]} sampleNew
 * @param {Object.<string, string|number|boolean>} properties
 * @return {number[]}
 * @override
 */
MixedSampleCombiner.prototype.combineSamples = function (dofIndex, samplePrev, sampleNew, properties) {
    var combiner = this._combinerList[dofIndex];
    if (!combiner) {
        throw new Error("no combiner specified for DOF: " + dofIndex);
    }
    return combiner.combineSamples(dofIndex, samplePrev, sampleNew, properties);
};
module.exports = MixedSampleCombiner;

},{"./SampleCombiner":19}],16:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * @constructor
 */
var MotionGenerator = function () {
};
/* superclass definition:        */
/* eslint-disable no-unused-vars */
/**
 * @returns {string}
 * @virtual
 */
MotionGenerator.prototype.getName = function () {
};
/**
 * @returns {jibo.animate.Time}
 * @virtual
 */
MotionGenerator.prototype.getStartTime = function () {
};
/**
 * Returns true if this generator ends after the given time.
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @virtual
 */
MotionGenerator.prototype.endsAfter = function (time) {
};
/**
 * Returns false if this generator has data for any DOF, true otherwise.
 * @returns {boolean}
 * @virtual
 */
MotionGenerator.prototype.isEmpty = function () {
};
/**
 * Returns true if this generator has data for the specified DOF past the given time.
 * @param {number} dofIndex
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @virtual
 */
MotionGenerator.prototype.dofEndsAfter = function (dofIndex, time) {
};
/**
 * Force this motion to end the specified tracks at or before cropTime.  If a track
 * already ends before cropTime it is unchanged.  If a track starts after
 * cropTime it is completely removed.
 *
 * @param {jibo.animate.Time} cropTime - crop to end at this time if necessary
 * @param {number[]} dofIndices - crop tracks for these dofs
 * @virtual
 */
MotionGenerator.prototype.cropEnd = function (cropTime, dofIndices) {
};
/**
 * get all DOFs that are involved in this motion
 *
 * @returns {number[]}
 * @virtual
 */
MotionGenerator.prototype.getDOFIndices = function () {
};
/**
 * @param {jibo.animate.Time} currentTime
 * @virtual
 */
MotionGenerator.prototype.notifyUpdateStarted = function (currentTime) {
};
/**
 * @param {jibo.animate.Time} currentTime
 * @virtual
 */
MotionGenerator.prototype.notifyUpdateFinished = function (currentTime) {
};
/**
 * @virtual
 */
MotionGenerator.prototype.notifyRemoved = function () {
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @virtual
 */
MotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
};
module.exports = MotionGenerator;

},{}],17:[function(require,module,exports){
/**
 * @author jg, mattb
 */
"use strict";
var Pose = require("../../ifr-motion/base/Pose");
var DOFGlobalAlignment = require("../../ifr-motion/base/DOFGlobalAlignment");
var CyclicMath = require("../../ifr-motion/base/CyclicMath");
var slog = require("../../ifr-core/SLog");
var TimelineEventDispatcher = require("./TimelineEventDispatcher");
var LayerState = require("./LayerState");
/**
 * @param {string} name
 * @param {RobotInfo} robotInfo
 * @param {Clock} clock
 * @param {LayerCombiner} layerCombiner
 * @param {string} modalityName
 *
 * @constructor
 */
var MotionTimeline = function (name, robotInfo, clock, layerCombiner, modalityName) {
    /** @type {string} */
    this._name = name;
    /** @type {Array.<MotionGenerator[]>} */
    this._layers = [];
    /** @type {string[]} */
    this._layerNames = [];
    /** @type {Object.<string, number>} */
    this._layerNameToIndex = {};
    /** @type {RobotInfo} */
    this._robotInfo = robotInfo;
    /** @type {string[]} */
    this._dofNames = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames();
    /** @type {Object.<string, number>} */
    this._dofNamesToIndices = robotInfo.getKinematicInfo().getDefaultPose().getDOFNamesToIndices();
    /**
     * current state for each layer
     * @type {Array.<LayerState>}*/
    this._layerStates = [];
    /**
     * previous state for each layer
     * @type {Array.<LayerState>}*/
    this._previousLayerStates = [];
    /**
     * full combined system state
     * @type {LayerState} */
    this._systemState = new LayerState(clock.currentTime(), robotInfo.getKinematicInfo().getDefaultPose().getCopy());
    /**
     * previous combined system state
     * @type {LayerState}*/
    this._previousSystemState = this._systemState.getCopy();
    /** @type {Object} */
    this._blackboard = {};
    /** @type {Array.<*>} */
    this._outputs = [];
    /** @type {Clock} */
    this._clock = clock;
    /** @type {LayerCombiner} */
    this._layerCombiner = layerCombiner;
    /** @type {string} */
    this._modalityName = modalityName;
    /** @type {DOFGlobalAlignment} */
    this._dofAlignment = new DOFGlobalAlignment(this._robotInfo.getKinematicInfo().getFullKinematicGroup(), null);
    /** @type {string[]} */
    var sortedDOFNames = this._dofNames.slice(0);
    sortedDOFNames = this._dofAlignment.sortDOFsByDepth(sortedDOFNames);
    /** @type {number[]} */
    this._sortedDOFIndices = [];
    var dofIndex;
    for (dofIndex = 0; dofIndex < sortedDOFNames.length; dofIndex++) {
        this._sortedDOFIndices.push(this._dofNamesToIndices[sortedDOFNames[dofIndex]]);
    }
    /** @type {Array.<boolean[]>} */
    this._layerDOFFlags = [];
    /** @type {DOFInfo[]} */
    this._dofInfoList = [];
    for (dofIndex = 0; dofIndex < this._dofNames.length; dofIndex++) {
        this._dofInfoList.push(this._robotInfo.getDOFInfo(this._dofNames[dofIndex]));
    }
    /** @type {number} */
    this._minimumUpdateDelay = 0.01;
};
/**
 * @param {string} modality
 *
 * @return {MotionTimeline}
 */
MotionTimeline.prototype.getModalityDelegate = function (modality) {
    if (modality === this._modalityName) {
        return this;
    }
    else {
        return null;
    }
};
/**
 * @return {Clock}
 */
MotionTimeline.prototype.getClock = function () {
    return this._clock;
};
/**
 * @return {string}
 */
MotionTimeline.prototype.getName = function () {
    return this._name;
};
/**
 * @param {string} layerName
 * @param {string[]} [dofs]
 */
MotionTimeline.prototype.createLayer = function (layerName, dofs) {
    if (!this._layerNameToIndex.hasOwnProperty(layerName)) {
        if (dofs == null) {
            dofs = this._dofNames;
        }
        var layerIndex = this._layers.length;
        this._layers.push([]);
        this._layerNames.push(layerName);
        this._layerNameToIndex[layerName] = layerIndex;
        var initialPose = this._robotInfo.getKinematicInfo().getDefaultPose();
        var pose = new Pose(layerName + "_pose", dofs.slice(0));
        pose.setPose(initialPose);
        var state = new LayerState(this._clock.currentTime(), pose);
        this._layerStates.push(state);
        this._previousLayerStates.push(state.getCopy());
        var dofFlags = new Array(this._dofNames.length).fill(false);
        for (var i = 0; i < dofs.length; i++) {
            var dofIndex = this._dofNamesToIndices[dofs[i]];
            dofFlags[dofIndex] = true;
        }
        this._layerDOFFlags.push(dofFlags);
    }
    else {
        slog.error("Not creating Timeline layer " + layerName + " since we already have one!");
    }
};
/**
 * @return {Array.<string>}
 */
MotionTimeline.prototype.getLayerNames = function () {
    return this._layerNames.slice(0);
};
/**
 * @return {LayerCombiner}
 */
MotionTimeline.prototype.getLayerCombiner = function () {
    return this._layerCombiner;
};
/**
 * get the current combined state for the timeline.
 * the state will combine all layers by default, or optionally just a
 * specified subset of layers.
 * @param {string[]} [layerNames] - the subset of layers to combine (defaults to all layers)
 * @return {LayerState}
 */
MotionTimeline.prototype.getCurrentState = function (layerNames) {
    if (!layerNames) {
        return this._systemState;
    }
    /** @type {LayerState[]} */
    var layerStates = [];
    /** @type {number[]} */
    var layerIndices = [];
    var i, layerIndex;
    for (i = 0; i < layerNames.length; i++) {
        layerIndex = this._layerNameToIndex[layerNames[i]];
        if (layerIndex !== undefined) {
            layerStates.push(this._layerStates[layerIndex]);
            layerIndices.push(layerIndex);
        }
        else {
            slog.error("MotionTimeline: requested state for unknown layer: " + layerNames[i]);
            return null;
        }
    }
    var currentState = this._layerCombiner.combineLayers(layerIndices, layerStates);
    // calculate velocity
    if (currentState !== null) {
        /** @type {LayerState[]} */
        var previousLayers = null;
        if (currentState.getTime().subtract(this._previousLayerStates[layerIndices[0]].getTime()) >= this._minimumUpdateDelay) {
            previousLayers = this._previousLayerStates;
        }
        if (previousLayers !== null) {
            /** @type {LayerState[]} */
            var previousLayerStates = [];
            for (i = 0; i < layerIndices.length; i++) {
                previousLayerStates.push(previousLayers[layerIndices[i]]);
            }
            var previousState = this._layerCombiner.combineLayers(layerIndices, previousLayerStates);
            if (previousState !== null) {
                this.computeVelocity(previousState, currentState);
            }
        }
    }
    return currentState;
};
/**
 * @param {MotionGenerator} motionGenerator
 * @param {string} layerName
 * @return {MotionGenerator} - the motion generator, or null if add failed
 */
MotionTimeline.prototype.add = function (motionGenerator, layerName) {
    var layerIndex = this._layerNameToIndex[layerName];
    if (layerIndex === undefined) {
        slog.error("MotionTimeline: skipping add on unknown layer: " + layerName);
        return null;
    }
    var startTime = motionGenerator.getStartTime();
    var dofIndices = motionGenerator.getDOFIndices();
    var insertAt = 0;
    var intoLayer = this._layers[layerIndex];
    var i = 0;
    while (i < intoLayer.length) {
        //iterate over clips in this layer.  find the spot where we should be inserted
        //crop existing clips if necessary, and delete them if the crop makes them empty
        var clip = intoLayer[i];
        if (clip.endsAfter(startTime)) {
            //clip may need to be truncated where it overlaps with newClip
            clip.cropEnd(startTime, dofIndices);
        }
        if (!clip.isEmpty()) {
            i++;
        }
        else {
            intoLayer.splice(i, 1); //remove the clip
            clip.notifyRemoved();
        }
        if (startTime.isGreaterOrEqual(clip.getStartTime())) {
            insertAt = i; //we can be after "clip".  insertAt will advance until we cannot be after the "clip"
        }
    }
    if (!motionGenerator.isEmpty()) {
        intoLayer.splice(insertAt, 0, motionGenerator);
    }
    else {
        //console.log("Immediately removing new clip "+newClip.getName()+" since it has zero duration");
        motionGenerator.notifyRemoved();
        motionGenerator = null;
    }
    return motionGenerator;
};
/**
 * Remove any clips that end on or before cullToTime.
 *
 * @param {jibo.animate.Time} cullToTime
 */
MotionTimeline.prototype.cullUpToTime = function (cullToTime) {
    var li, ci;
    for (li = 0; li < this._layers.length; li++) {
        var layer = this._layers[li];
        ci = 0;
        while (ci < layer.length && cullToTime.isGreater(layer[ci].getStartTime())) {
            var clip = layer[ci];
            if (!clip.endsAfter(cullToTime)) {
                layer.splice(ci, 1); //remove from layer, don't need to increase index
                clip.notifyRemoved();
            }
            else {
                ci++;
            }
        }
    }
};
/**
 * @param {jibo.animate.Time} currentTime
 */
MotionTimeline.prototype.render = function (currentTime) {
    var layerIndex, sortedDOFIndex, dofIndex, clipIndex;
    var layer, clip;
    /** @type {number[]} */
    var newDOFState;
    /** @type {MotionGenerator} */
    var generatorForDOF;
    ///** @type {jibo.animate.Time} */
    var previousLayerRenderTime;
    // swap the current and previous states
    var tempState = this._previousSystemState;
    this._previousSystemState = this._systemState;
    this._systemState = tempState;
    this._systemState.setTime(currentTime);
    for (layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
        tempState = this._previousLayerStates[layerIndex];
        this._previousLayerStates[layerIndex] = this._layerStates[layerIndex];
        this._layerStates[layerIndex] = tempState;
        this._layerStates[layerIndex].setTime(currentTime);
    }
    // clear the blackboard
    this._blackboard = {};
    // render dof-by-dof in skeleton-sorted order
    for (sortedDOFIndex = 0; sortedDOFIndex < this._sortedDOFIndices.length; sortedDOFIndex++) {
        dofIndex = this._sortedDOFIndices[sortedDOFIndex];
        for (layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
            if (this._layerDOFFlags[layerIndex][dofIndex]) {
                layer = this._layers[layerIndex];
                previousLayerRenderTime = this._previousLayerStates[layerIndex].getTime();
                /** @type {MotionGenerator} */
                generatorForDOF = null;
                clipIndex = 0;
                while (clipIndex < layer.length && currentTime.isGreaterOrEqual(layer[clipIndex].getStartTime())) {
                    clip = layer[clipIndex];
                    if (clip.dofEndsAfter(dofIndex, previousLayerRenderTime)) {
                        generatorForDOF = clip;
                    }
                    clipIndex++;
                }
                /** @type {number[]} */
                newDOFState = null;
                if (generatorForDOF) {
                    newDOFState = generatorForDOF.getDOFState(dofIndex, this._systemState, this._blackboard);
                    // check for invalid dof states
                    if (!(newDOFState instanceof Array) || newDOFState.length === 0) {
                        slog.warn("MotionTimeline: generator " + generatorForDOF.getName() + " on layer " + this._layerNames[layerIndex] + " generated non-array or empty value for " + this._dofNames[dofIndex] + ":");
                        slog.warn("MotionTimeline: generated value: (" + newDOFState + ")");
                        newDOFState = null;
                    }
                    else if (this._dofInfoList[dofIndex].isMetric() && (!Number.isFinite(newDOFState[0]) || (newDOFState.length > 1 && !Number.isFinite(newDOFState[1])))) {
                        slog.warn("MotionTimeline: generator " + generatorForDOF.getName() + " on layer " + this._layerNames[layerIndex] + " generated non-finite value for " + this._dofNames[dofIndex] + ":");
                        slog.warn("MotionTimeline: generated value: (" + newDOFState + ")");
                        newDOFState = null;
                    }
                }
                if (newDOFState === null) {
                    // use the state from the previous tick
                    newDOFState = this._previousLayerStates[layerIndex].getDOFStateByIndex(dofIndex);
                }
                this._layerStates[layerIndex].setDOFStateByIndex(dofIndex, newDOFState);
                // update partial render state
                if (layerIndex === 0) {
                    this._systemState.setDOFStateByIndex(dofIndex, newDOFState);
                }
                else {
                    this._layerCombiner.incrementState(this._systemState, layerIndex, this._layerStates[layerIndex], dofIndex);
                }
            }
        }
    }
    // compute the velocity for the current state
    this.computeVelocity(this._previousSystemState, this._systemState);
};
MotionTimeline.prototype.addOutput = function (output) {
    this._outputs.push(output);
};
MotionTimeline.prototype.removeOutput = function (output) {
    var outputIndex = this._outputs.indexOf(output);
    if (outputIndex > -1) {
        this._outputs.splice(outputIndex, 1);
    }
};
/**
 * @return {Object[]}
 */
MotionTimeline.prototype.getOutputs = function () {
    return this._outputs;
};
/**
 * compute velocity between two layer states, storing the result in the second state
 * @param {LayerState} previousLayerState
 * @param {LayerState} currentLayerState
 */
MotionTimeline.prototype.computeVelocity = function (previousLayerState, currentLayerState) {
    var elapsedTime = currentLayerState.getTime().subtract(previousLayerState.getTime());
    var previousPose = previousLayerState.getPose();
    var currentPose = currentLayerState.getPose();
    var dofIndices = currentPose.getDOFIndices();
    for (var d = 0; d < dofIndices.length; d++) {
        var dofIndex = dofIndices[d];
        var dofInfo = this._dofInfoList[dofIndex];
        if (dofInfo.isMetric()) {
            var currentValue = currentPose.getByIndex(dofIndex, 0);
            var previousValue = previousPose.getByIndex(dofIndex, 0);
            if (dofInfo.isCyclic()) {
                currentValue = CyclicMath.closestEquivalentRotation(currentValue, previousValue);
            }
            var velocity = (currentValue - previousValue) / elapsedTime;
            //if(isNaN(velocity)){
            //	slog.error("MotionTimeline: got NaN velocity for "+dofName+" from "+previousValue+" to "+currentValue+" over time "+elapsedTime);
            //}
            currentPose.setByIndex(dofIndex, velocity, 1);
        }
    }
};
MotionTimeline.prototype.update = function () {
    /** @type {jibo.animate.Time} */
    var currentTime = this._clock.currentTime();
    if (currentTime.subtract(this._systemState.getTime()) < this._minimumUpdateDelay) {
        // update too soon, return!
        return;
    }
    //var layerNames = this._layerNames;
    var layerIndex, clipIndex;
    var layer;
    var clip;
    // notify update started
    for (layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
        layer = this._layers[layerIndex];
        for (clipIndex = 0; clipIndex < layer.length; clipIndex++) {
            clip = layer[clipIndex];
            clip.notifyUpdateStarted(currentTime);
        }
    }
    // render
    this.render(currentTime);
    // update outputs
    for (var outputIndex = 0; outputIndex < this._outputs.length; outputIndex++) {
        var out = this._outputs[outputIndex];
        out.handleOutput(currentTime, this._systemState.getPose(), this._blackboard);
    }
    // notify update finished
    for (layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
        layer = this._layers[layerIndex];
        for (clipIndex = 0; clipIndex < layer.length; clipIndex++) {
            clip = layer[clipIndex];
            clip.notifyUpdateFinished(currentTime);
        }
    }
    this.cullUpToTime(currentTime);
    TimelineEventDispatcher.dispatchQueuedEvents();
};
/**
 * @param {string} layerName
 * @return {string[]}
 */
MotionTimeline.prototype.getDOFsForLayer = function (layerName) {
    var layerIndex = this._layerNameToIndex[layerName];
    if (layerIndex !== undefined) {
        return this._layerStates[layerIndex].getDOFNames();
    }
    else {
        return null;
    }
};
module.exports = MotionTimeline;

},{"../../ifr-core/SLog":57,"../../ifr-motion/base/CyclicMath":70,"../../ifr-motion/base/DOFGlobalAlignment":71,"../../ifr-motion/base/Pose":78,"./LayerState":10,"./TimelineEventDispatcher":23}],18:[function(require,module,exports){
/**
 * @author mattb
 */
/**
 * @author mattb
 */
"use strict";
var BaseMotionGenerator = require("./BaseMotionGenerator");
/**
 * @param {AnimationUtilities} animUtils
 * @param {string} name
 * @param {jibo.animate.Time} startTime
 * @param {Pose} pose
 * @param {number} duration - duration in seconds
 * @constructor
 * @extends BaseMotionGenerator
 */
var PoseMotionGenerator = function (animUtils, name, startTime, pose, duration) {
    BaseMotionGenerator.call(this, animUtils, name, startTime);
    this._initWithDOFIndices(pose.getDOFIndices(), startTime.add(duration));
    /** @type {Pose} */
    this._pose = pose;
};
PoseMotionGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
PoseMotionGenerator.prototype.constructor = PoseMotionGenerator;
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @override
 */
PoseMotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    return this._pose.getByIndex(dofIndex);
};
module.exports = PoseMotionGenerator;

},{"./BaseMotionGenerator":8}],19:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var SampleCombiner = function () {
};
/* superclass definition:        */
/* eslint-disable no-unused-vars */
/**
 *
 * @param {number} dofIndex
 * @param {number[]} samplePrev
 * @param {number[]} sampleNew
 * @param {Object.<string, string|number|boolean>} properties
 * @return {number[]}
 * @abstract
 */
SampleCombiner.prototype.combineSamples = function (dofIndex, samplePrev, sampleNew, properties) {
};
module.exports = SampleCombiner;

},{}],20:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var SampleCombiner = require("./SampleCombiner");
/**
 * Scale incoming samples by our samples.  Our samples will first be mapped
 * from their raw dof values, using linear interpolation, based on the 2 poses
 * provided the constructor.
 *
 * @param {RobotInfo} robotInfo
 * @param {Pose} unityScalePose - dof values to map to scale of 1 (defaults to 1's)
 * @param {Pose} zeroScalePose - dof values to map to scale of 0 (defaults to 0's)
 * @param {string[]} dofNames - used to initialize defaults.  should include at least all dofs that this combined will be combining
 * @constructor
 * @extends SampleCombiner
 */
var ScaleSampleCombiner = function (robotInfo, unityScalePose, zeroScalePose, dofNames) {
    SampleCombiner.call(this);
    var dofCount = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames().length;
    /** @type {Object.<string, number>} */
    var dofNamesToIndices = robotInfo.getKinematicInfo().getDefaultPose().getDOFNamesToIndices();
    //init the interpolation mapping
    this._unityScales = new Array(dofCount).fill(1);
    this._zeroScales = new Array(dofCount).fill(0);
    //for some dofs, unity and zero may be the same value.  in those cases we will not scale.
    //use this epsilon when considering if the values are "the same"; we will modify the save
    //unity value to match the zero value so the runtime computation can just check with "==="
    var epsilon = 0.00001;
    for (var i = 0; i < dofNames.length; i++) {
        var dofName = dofNames[i];
        var dofIndex = dofNamesToIndices[dofName];
        if (unityScalePose != null && unityScalePose.get(dofName) != null) {
            this._unityScales[dofIndex] = unityScalePose.get(dofName)[0];
        }
        else {
            this._unityScales[dofIndex] = 1;
        }
        if (zeroScalePose != null && zeroScalePose.get(dofName) != null) {
            this._zeroScales[dofIndex] = zeroScalePose.get(dofName)[0];
        }
        else {
            this._zeroScales[dofIndex] = 0;
        }
        if (Math.abs(this._unityScales[dofIndex] - this._zeroScales[dofIndex]) < epsilon) {
            this._unityScales[dofIndex] = this._zeroScales[dofIndex];
        }
    }
};
ScaleSampleCombiner.prototype = Object.create(SampleCombiner.prototype);
ScaleSampleCombiner.prototype.constructor = ScaleSampleCombiner;
/**
 * Scales all components of samplePrev by sampleNew's 0th component
 * mapped to a scale using unityScale and zeroScale values.
 *
 * @param {number} dofIndex
 * @param {number[]} samplePrev
 * @param {number[]} sampleNew
 * @param {Object.<string, string|number|boolean>} properties
 * @return {number[]}
 * @override
 */
ScaleSampleCombiner.prototype.combineSamples = function (dofIndex, samplePrev, sampleNew, properties) {
    var r = [];
    var unityVal = this._unityScales[dofIndex];
    var zeroVal = this._zeroScales[dofIndex];
    var scale = 1;
    if (unityVal !== zeroVal) {
        scale = (sampleNew[0] - zeroVal) / (unityVal - zeroVal) + zeroVal;
    }
    if (isNaN(scale)) {
        scale = 1;
    }
    for (var i = 0; i < samplePrev.length; i++) {
        r.push(samplePrev[i] * scale);
    }
    return r;
};
module.exports = ScaleSampleCombiner;

},{"./SampleCombiner":19}],21:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var LayerCombiner = require("./LayerCombiner");
var slog = require("../../ifr-core/SLog");
/**
 * @param {RobotInfo} robotInfo
 * @constructor
 */
var SimpleLayerCombiner = function (robotInfo) {
    LayerCombiner.call(this);
    /** @type {SampleCombiner[]} */
    this.sampleCombiners = [];
    /** @type {string[]} */
    this.layerNames = [];
    /** @type {string[]} */
    this.dofNames = robotInfo.getKinematicInfo().getDefaultPose().getDOFIndicesToNames();
    /** @type {DOFInfo[]} */
    this.dofInfoList = [];
    for (var dofIndex = 0; dofIndex < this.dofNames.length; dofIndex++) {
        this.dofInfoList.push(robotInfo.getDOFInfo(this.dofNames[dofIndex]));
    }
};
SimpleLayerCombiner.prototype = Object.create(LayerCombiner.prototype);
SimpleLayerCombiner.prototype.constructor = SimpleLayerCombiner;
/**
 * @param {string} layerName
 * @param {SampleCombiner} sampleCombiner
 */
SimpleLayerCombiner.prototype.addSampleCombiner = function (layerName, sampleCombiner) {
    this.layerNames.push(layerName);
    this.sampleCombiners.push(sampleCombiner);
};
/**
 * @param {number[]} layerIndices
 * @param {LayerState[]} layerStates
 * @returns {LayerState}
 */
SimpleLayerCombiner.prototype.combineLayers = function (layerIndices, layerStates) {
    if (!layerIndices) {
        return null;
    }
    var combinedState = layerStates[0].getCopy();
    for (var i = 1; i < layerIndices.length; i++) {
        var dofIndices = layerStates[i].getPose().getDOFIndices();
        for (var d = 0; d < dofIndices.length; d++) {
            this.incrementState(combinedState, layerIndices[i], layerStates[i], dofIndices[d]);
        }
    }
    return combinedState;
};
/**
 * @param {LayerState} combinedState
 * @param {number} layerIndex
 * @param {LayerState} layerState
 * @param {number} dofIndex
 * @abstract
 */
SimpleLayerCombiner.prototype.incrementState = function (combinedState, layerIndex, layerState, dofIndex) {
    var currentValue = combinedState.getPose().getByIndex(dofIndex);
    var layerValue = layerState.getPose().getByIndex(dofIndex);
    var combiner = this.sampleCombiners[layerIndex];
    if (!currentValue || !layerValue || !combiner) {
        // skip layer
    }
    else {
        var combinedValue = combiner.combineSamples(dofIndex, currentValue, layerValue, null);
        if (!(combinedValue instanceof Array) || combinedValue.length === 0) {
            slog.warn("LayerCombiner: combiner on layer " + this.layerNames[layerIndex] + " generated non-array or empty value for " + this.dofNames[dofIndex] + ":");
            slog.warn("LayerCombiner: current state: (" + currentValue + ") layer state: (" + layerValue + ") resulting value: (" + combinedValue + ")");
        }
        else if (this.dofInfoList[dofIndex].isMetric() && (!Number.isFinite(combinedValue[0]) || (combinedValue.length > 1 && !Number.isFinite(combinedValue[1])))) {
            slog.warn("LayerCombiner: combiner on layer " + this.layerNames[layerIndex] + " generated non-finite value for " + this.dofNames[dofIndex] + ":");
            slog.warn("LayerCombiner: current state: (" + currentValue + ") layer state: (" + layerValue + ") resulting value: (" + combinedValue + ")");
        }
        else {
            combinedState.getPose().setByIndex(dofIndex, combinedValue);
        }
    }
};
module.exports = SimpleLayerCombiner;

},{"../../ifr-core/SLog":57,"./LayerCombiner":9}],22:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
//var MotionValidator = require("../../ifr-motion/base/MotionValidator");
var BaseMotionGenerator = require("./BaseMotionGenerator");
var TimelineEventDispatcher = require("./TimelineEventDispatcher");
var RelativeTimeClip = require("../../ifr-motion/base/RelativeTimeClip");
/**
 * @param {AnimationUtilities} animUtils
 * @param {Motion} motion
 * @param {jibo.animate.Time} startTime
 * @param {RobotInfo} robotInfo
 * @param {string[]} [dofNames]
 * @param {RelativeTimeClip} [clip] - optional clip info
 * @constructor
 * @extends BaseMotionGenerator
 */
var SimpleMotionGenerator = function (animUtils, motion, startTime, robotInfo, dofNames, clip) {
    if (dofNames === null || dofNames === undefined) {
        dofNames = motion.getDOFs();
    }
    if (!clip) {
        clip = new RelativeTimeClip(0, motion.getDuration(), 1);
    }
    BaseMotionGenerator.call(this, animUtils, motion.getName(), startTime);
    this._initWithDOFNames(dofNames, startTime.add(clip.getDuration()));
    //TODO: enable MotionValidator via DEBUG flag
    //MotionValidator.valuesExist(motion, dofNames);
    /** @type {RelativeTimeClip} */
    this._clip = clip;
    /** @type {InterpolatorSet} */
    var interpolatorSet = robotInfo.getKinematicInfo().getInterpolatorSet();
    var dofCount = this._dofMask.length;
    /** @type {MotionTrack[]} */
    this._motionTracks = new Array(dofCount).fill(null);
    /** @type {Interpolators.BaseInterpolator[]} */
    this._interpolators = new Array(dofCount).fill(null);
    for (var i = 0; i < dofNames.length; i++) {
        var dofIndex = this._dofs[i];
        var dofName = dofNames[i];
        this._motionTracks[dofIndex] = motion.getTracks()[dofName];
        this._interpolators[dofIndex] = interpolatorSet.getInterpolator(dofName);
    }
    /** @type {MotionEventIterator} */
    this._customEvents = null;
    /** @type {boolean} */
    this._sourceTimeReportingEnabled = false;
    /** @type {number} */
    this._baseDOFIndex = this._animUtils.dofNamesToIndices[this._animUtils.dofs.BASE.getDOFs()[0]];
    /** @type {BlendMode} */
    this._baseBlendMode = null;
};
SimpleMotionGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
SimpleMotionGenerator.prototype.constructor = SimpleMotionGenerator;
/**
 * @param {MotionEventIterator} motionEvents
 */
SimpleMotionGenerator.prototype.setEvents = function (motionEvents) {
    this._customEvents = motionEvents;
};
/**
 * @param {boolean} enabled
 */
SimpleMotionGenerator.prototype.setSourceTimeReportingEnabled = function (enabled) {
    this._sourceTimeReportingEnabled = enabled;
};
/**
 * @param {BlendMode} blendMode
 */
SimpleMotionGenerator.prototype.setBaseBlendMode = function (blendMode) {
    this._baseBlendMode = blendMode;
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @override
 */
SimpleMotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    var sampleTime = this._currentTime;
    var endTime = this._dofEndTimes[dofIndex];
    if (endTime !== null && sampleTime.isGreater(endTime)) {
        sampleTime = endTime;
    }
    var relativeSampleTime = sampleTime.subtract(this._startTime);
    var motionTime = this._clip.getSourceTime(relativeSampleTime);
    var sample = this._motionTracks[dofIndex].getDataAtTime(motionTime, this._interpolators[dofIndex]);
    if (this._sourceTimeReportingEnabled) {
        if (!blackboard.sourceTimes) {
            blackboard.sourceTimes = {};
        }
        blackboard.sourceTimes[this.getName()] = motionTime;
    }
    if (this._baseBlendMode !== null && dofIndex === this._baseDOFIndex) {
        blackboard.baseBlendMode = this._baseBlendMode;
    }
    return sample;
};
/**
 * @override
 */
SimpleMotionGenerator.prototype.queueCustomEvents = function () {
    if (this._clipEventHandler && this._customEvents) {
        var sampleTime = this._currentTime;
        if (this._endTime !== null && sampleTime.isGreater(this._endTime)) {
            sampleTime = this._endTime;
        }
        var relativeSampleTime = sampleTime.subtract(this._startTime);
        while (this._customEvents.hasNext(relativeSampleTime)) {
            TimelineEventDispatcher.queueEvent(this._clipEventHandler, [this._customEvents.next(relativeSampleTime)]);
        }
    }
};
module.exports = SimpleMotionGenerator;

},{"../../ifr-motion/base/RelativeTimeClip":79,"./BaseMotionGenerator":8,"./TimelineEventDispatcher":23}],23:[function(require,module,exports){
/**
 * Queue timeline events until the end of the Timeline operations so callbacks are
 * not encouraged to modify the timeline during timeline modifications
 *
 * @author jg
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var eventQueue = [];
var TimelineEventDispatcher = {
    queueEvent: function (theFunction, theArgs) {
        if (theFunction == null) {
            slog.error("Error, null/undefined function queued!\n" + new Error().stack);
        }
        eventQueue.push({ f: theFunction, a: theArgs });
    },
    dispatchQueuedEvents: function () {
        for (var i = 0; i < eventQueue.length; i++) {
            var e = eventQueue[i];
            e.f.apply(null, e.a);
        }
        eventQueue.length = 0;
    }
};
module.exports = TimelineEventDispatcher;

},{"../../ifr-core/SLog":57}],24:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var BaseMotionGenerator = require("./BaseMotionGenerator");
var RelativeTimeClip = require("../../ifr-motion/base/RelativeTimeClip");
/**
 * Wraps a motion generator to enable varying its playback speed.
 * @param {AnimationUtilities} animUtils
 * @param {MotionGenerator} generator - motion generator to wrap
 * @param {number} initialSpeed - initial speed
 * @constructor
 * @extends BaseMotionGenerator
 */
var VariableSpeedMotionGenerator = function (animUtils, generator, initialSpeed) {
    BaseMotionGenerator.call(this, animUtils, generator.getName(), generator.getStartTime());
    this._initWithDOFIndices(generator.getDOFIndices(), null);
    /** @type {MotionGenerator} */
    this._generator = generator;
    /** @type {RelativeTimeClip} */
    this._clip = new RelativeTimeClip(0, Number.MAX_VALUE, initialSpeed);
    /** @type {jibo.animate.Time} */
    this._latestUpdateTime = generator.getStartTime();
    /** @type {jibo.animate.Time} */
    this._latestSpeedChangeTime = generator.getStartTime();
    /** @type {jibo.animate.Time} */
    this._generatorTimeAtLatestUpdate = generator.getStartTime();
    /** @type {jibo.animate.Time} */
    this._latestMapInputTime = null;
    /** @type {jibo.animate.Time} */
    this._latestMapOutputTime = null;
};
VariableSpeedMotionGenerator.prototype = Object.create(BaseMotionGenerator.prototype);
VariableSpeedMotionGenerator.prototype.constructor = VariableSpeedMotionGenerator;
/**
 * @returns {number}
 */
VariableSpeedMotionGenerator.prototype.getSpeed = function () {
    return this._clip.getSpeed();
};
/**
 * @param {number} newSpeed - new speed
 */
VariableSpeedMotionGenerator.prototype.setSpeed = function (newSpeed) {
    var sourceTimeAtLatestUpdate = this._generatorTimeAtLatestUpdate.subtract(this._startTime);
    this._clip = new RelativeTimeClip(sourceTimeAtLatestUpdate, this._clip.getOutPoint(), newSpeed);
    this._latestSpeedChangeTime = this._latestUpdateTime;
};
/**
 * Maps the specified time into the frame of the generator.
 * @param {jibo.animate.Time} time
 * @returns {jibo.animate.Time}
 * @override
 */
VariableSpeedMotionGenerator.prototype._mapTime = function (time) {
    if (this._latestMapInputTime !== null && this._latestMapInputTime.equals(time)) {
        return this._latestMapOutputTime;
    }
    var generatorTime = null;
    if (time.isGreater(this._startTime)) {
        var elapsedTime = time.subtract(this._latestSpeedChangeTime);
        var sourceTime = this._clip.getSourceTime(elapsedTime);
        generatorTime = this._startTime.add(sourceTime);
    }
    else {
        // don't map times before start time
        generatorTime = time;
    }
    this._latestMapInputTime = time;
    this._latestMapOutputTime = generatorTime;
    return generatorTime;
};
/**
 * Returns true if this generator ends after the given time.
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @override
 */
VariableSpeedMotionGenerator.prototype.endsAfter = function (time) {
    if (BaseMotionGenerator.prototype.endsAfter.call(this, time)) {
        // map time and ask generator
        return this._generator.endsAfter(this._mapTime(time));
    }
    else {
        return false;
    }
};
/**
 * Returns true if this generator has data for the specified DOF past the given time.
 * @param {number} dofIndex
 * @param {jibo.animate.Time} time
 * @returns {boolean}
 * @override
 */
VariableSpeedMotionGenerator.prototype.dofEndsAfter = function (dofIndex, time) {
    if (BaseMotionGenerator.prototype.dofEndsAfter.call(this, dofIndex, time)) {
        // map time and ask generator
        return this._generator.dofEndsAfter(dofIndex, this._mapTime(time));
    }
    else {
        return false;
    }
};
/**
 * Force this motion to end the specified tracks at or before cropTime.  If a track
 * already ends before cropTime it is unchanged.  If a track starts after
 * cropTime it is completely removed.
 *
 * @param {jibo.animate.Time} cropTime - crop to end at this time if necessary
 * @param {number[]} dofIndices - crop tracks for these dofs
 * @override
 */
VariableSpeedMotionGenerator.prototype.cropEnd = function (cropTime, dofIndices) {
    BaseMotionGenerator.prototype.cropEnd.call(this, cropTime, dofIndices);
    // also crop underlying generator
    this._generator.cropEnd(this._mapTime(cropTime), dofIndices);
};
/**
 * @param {jibo.animate.Time} currentTime
 * @override
 */
VariableSpeedMotionGenerator.prototype.notifyUpdateStarted = function (currentTime) {
    var generatorTime = this._mapTime(currentTime);
    this._generator.notifyUpdateStarted(generatorTime);
    if (currentTime.isGreater(this._startTime)) {
        this._latestUpdateTime = currentTime;
        this._generatorTimeAtLatestUpdate = generatorTime;
    }
};
/**
 * @param {jibo.animate.Time} currentTime
 * @override
 */
VariableSpeedMotionGenerator.prototype.notifyUpdateFinished = function (currentTime) {
    this._generator.notifyUpdateFinished(this._mapTime(currentTime));
};
/**
 * @override
 */
VariableSpeedMotionGenerator.prototype.notifyRemoved = function () {
    this._generator.notifyRemoved();
};
/**
 * @param {number} dofIndex
 * @param {LayerState} partialRender
 * @param {Object} blackboard
 * @returns {number[]}
 * @virtual
 */
VariableSpeedMotionGenerator.prototype.getDOFState = function (dofIndex, partialRender, blackboard) {
    return this._generator.getDOFState(dofIndex, partialRender, blackboard);
};
module.exports = VariableSpeedMotionGenerator;

},{"../../ifr-motion/base/RelativeTimeClip":79,"./BaseMotionGenerator":8}],25:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var Time = require("../ifr-core/Time");
var slog = require("../ifr-core/SLog");
/**
 * Enum values for command mode
 * @enum {number}
 */
var AxisCommandMode = {
    NONE: 0,
    LIMP: 1,
    BRAKE: 2,
    PWM: 3,
    VELOCITY: 4,
    TRAJECTORY: 5,
    TORQUE: 6,
    POS_VEL: 7
};
/**
 * Enum values for single axis status
 * @enum {number}
 */
var StatusFieldBitMask = {
    INDEXED: 0x01,
    ENABLED: 0x02,
    BRAKED: 0x04,
    MOVING: 0x08,
    STALLED: 0x10,
    TIMEOUT: 0x20,
    FAULT: 0x40 //bit 6
};
/**
 * Enum values for motion limiter operation mode
 * @enum {number}
 */
var MotionLimiterMode = {
    DISABLED: -1,
    OK: 0,
    APPROACHING_LIMIT: 1,
    EXCEEDING_LIMIT: 2,
    UNINDEXED: 3
};
/**
 * @constructor
 */
var SingleAxisState = function () {
    /**
     * chronometer timestamp
     * @type {number[]} */
    this.ts = null;
    /**
     * absolute (indexed) position in radians, undefined until indexed
     * @type {number} */
    this.pos = null;
    /**
     * encoder position in radians, arbitrary zero based on power-up position
     * @type {number} */
    this.inc_pos = null;
    /**
     * velocity in radians/second
     * @type {number} */
    this.vel = null;
    /**
     * current in amperes
     * @type {number} */
    this.cur = null;
    /**
     * PWM value in % max PWM
     * @type {number} */
    this.pwm = null;
    /**
     * low-level flags for motor and driver status (integer)
     * @type {?number} */
    this.status = null;
    /**
     * velocity limit in radians/second
     * @type {number} */
    this.vel_limit = null;
    /**
     * acceleration limit in radians/second^2
     * @type {number} */
    this.acc_limit = null;
    /**
     * current limit in amperes
     * @type {number} */
    this.cur_limit = null;
    /**
     * command mode of the axis {none=0, limp=1, brake=2, pwm=3, vel=4, traj=5, trq=6}
     * @type {number} */
    this.mode = null;
    /**
     * reference value of trajectory generator (depends on command)
     * @type {number} */
    this.ref = null;
    /**
     * reference position (may not be reported for all modes)
     * @type {number} */
    this.ref_pos = null;
    /**
     * reference acc (may not be reported for all modes)
     * @type {number} */
    this.ref_acc = null;
    /**
     * hardware-level tick counter (milliseconds)
     * @type {number} */
    this.ticks = null;
    /**
     * value of the integral term of the PID loop
     * @type {number} */
    this.integrator = null;
    /**
     * Low level motor fault flags (int)
     * @type {number} */
    this.fault_status = null;
    /**
     * Counter of the number of observed index events. Wraps after 255. (int)
     * @type {number} */
    this.index_count = null;
    /**
     * Motion limiter operation mode (-1 == DISABLED, 0 == OK, 1 == APPROACHING_LIMIT, 2 == EXCEEDING_LIMIT). (int)
     * @type {number} */
    this.limiter_mode = null;
};
/**
 * @return {Time} - chronometer timestamp as a Time instance
 */
SingleAxisState.prototype.getTimestamp = function () {
    if (this.ts === null) {
        return null;
    }
    else {
        return Time.createFromTimestamp(this.ts);
    }
};
/**
 * @return {boolean} - true if axis is indexed (0th bit of status)
 */
SingleAxisState.prototype.isIndexed = function () {
    if (this.status === null) {
        return false;
    }
    else {
        /*jshint bitwise:false*/
        return (this.status & 0x01) > 0;
        /*jshint bitwise:true*/
    }
};
/**
 * @param {StatusFieldBitMask} statusBitMask
 * @return {boolean} - true if bit(s) represented by statusBitMask is(are) set for this axis (all must be set for "true" if multiple specified)
 */
SingleAxisState.prototype.hasStatus = function (statusBitMask) {
    if (this.status === null) {
        return false;
    }
    else {
        /*jshint bitwise:false*/
        return (this.status & statusBitMask) === statusBitMask;
        /*jshint bitwise:true*/
    }
};
/**
 * @return {number} - number of observed index events (wraps after 255)
 */
SingleAxisState.prototype.getIndexCount = function () {
    return this.index_count;
};
/**
 * @return {boolean} - true if there is currently a fault on the axis
 */
SingleAxisState.prototype.hasFault = function () {
    return this.fault_status !== null && this.fault_status !== 0;
};
/**
 * @return {number} - low level motor fault flags (int)
 */
SingleAxisState.prototype.getFault = function () {
    return this.fault_status;
};
/**
 * @return {MotionLimiterMode} - motion limiter operation mode
 */
SingleAxisState.prototype.getLimiterMode = function () {
    return this.limiter_mode !== null ? this.limiter_mode : MotionLimiterMode.DISABLED;
};
/**
 * @param {Object} jsonData
 * @return {SingleAxisState}
 */
SingleAxisState.prototype.setFromJson = function (jsonData) {
    var keys = Object.keys(jsonData);
    for (var i = 0; i < keys.length; i++) {
        if (this.hasOwnProperty(keys[i])) {
            this[keys[i]] = jsonData[keys[i]];
        }
        else {
            slog.info("SingleAxisState: unknown JSON property name: " + keys[i]);
        }
    }
    return this;
};
/**
 * @constructor
 */
var AxisState = function () {
    /**
     * overall update chronometer timestamp
     * @type {number[]} */
    this.ts = null;
    /** @type {SingleAxisState} */
    this.pelvis = null;
    /** @type {SingleAxisState} */
    this.torso = null;
    /** @type {SingleAxisState} */
    this.neck = null;
    /**
     * Bitmask representing lockout conditions, e.g. system policies that prevent control of the motors. (int)
     * @type {number} */
    this.lockout = null;
};
/**
 * @return {Time} - overall update chronometer timestamp as a Time instance
 */
AxisState.prototype.getTimestamp = function () {
    if (this.ts === null) {
        return null;
    }
    else {
        return Time.createFromTimestamp(this.ts);
    }
};
/**
 * @return {boolean} - true if a system lockout condition currently exists
 */
AxisState.prototype.hasLockout = function () {
    return this.lockout !== null && this.lockout !== 0;
};
/**
 * @return {number} - bitmask representing lockout conditions, e.g. system policies that prevent control of the motors. (int)
 */
AxisState.prototype.getLockout = function () {
    return this.lockout;
};
/**
 * @return {boolean} - true if there is currently a fault on any axis
 */
AxisState.prototype.hasFault = function () {
    return this.pelvis.hasFault() || this.torso.hasFault() || this.neck.hasFault();
};
/**
 * @return {boolean} - true if there is currently a timeout on any axis
 */
AxisState.prototype.hasTimeout = function () {
    var timeoutMask = StatusFieldBitMask.TIMEOUT;
    return this.pelvis.hasStatus(timeoutMask) || this.torso.hasStatus(timeoutMask) || this.neck.hasStatus(timeoutMask);
};
/**
 * @return {boolean} - true if all axis are indexed
 */
AxisState.prototype.allIndexed = function () {
    return this.pelvis.isIndexed() && this.torso.isIndexed() && this.neck.isIndexed();
};
/**
 * @return {MotionLimiterMode} - the most severe motion limiter mode being applied to any axis
 */
AxisState.prototype.getLimiterMode = function () {
    return Math.max(this.pelvis.getLimiterMode(), this.torso.getLimiterMode(), this.neck.getLimiterMode());
};
/**
 * @param {Object} jsonData
 * @return {AxisState}
 */
AxisState.prototype.setFromJson = function (jsonData) {
    this.ts = jsonData.ts;
    this.pelvis = new SingleAxisState().setFromJson(jsonData.pelvis);
    this.torso = new SingleAxisState().setFromJson(jsonData.torso);
    this.neck = new SingleAxisState().setFromJson(jsonData.neck);
    if (jsonData.lockout !== undefined) {
        this.lockout = jsonData.lockout;
    }
    return this;
};
/**
 * @constructor
 */
var SingleAxisCommand = function () {
    /**
     * command mode {none=0, limp=1, brake=2, pwm=3, vel=4, traj=5, trq=6}
     * @type {number} */
    this.mode = null;
    /**
     * command target, as defined by the mode
     * @type {number[]} */
    this.value = null;
    /**
     * velocity limit in radians/second
     * @type {number} */
    this.vel_limit = null;
    /**
     * acceleration limit in radians/second^2
     * @type {number} */
    this.acc_limit = null;
    /**
     * current limit in amperes
     * @type {number} */
    this.cur_limit = null;
};
/**
 * @constructor
 */
var AxisCommand = function () {
    /**
     * chronometer timestamp
     * @type {number[]} */
    this.ts = null;
    /** @type {SingleAxisCommand} */
    this.pelvis = null;
    /** @type {SingleAxisCommand} */
    this.torso = null;
    /** @type {SingleAxisCommand} */
    this.neck = null;
};
/**
 * @param {Time} timestamp
 */
AxisCommand.prototype.setTimestamp = function (timestamp) {
    this.ts = timestamp._timestamp;
};
/**
 * @constructor
 */
var LEDCommand = function () {
    /**
     * chronometer timestamp
     * @type {number[]} */
    this.ts = null;
    /**
     * RGB color value, percentage of maximum [0.0, 1.0]
     * @type {number[]} */
    this.color = null;
    /**
     * desired rate of change of each color value, in percent/second
     * @type {number[]} */
    this.rate_limit = null;
};
/**
 * @param {Time} timestamp
 */
LEDCommand.prototype.setTimestamp = function (timestamp) {
    this.ts = timestamp._timestamp;
};
/**
 * @param {number} rateLimit - desired rate of change, in percent/second
 */
LEDCommand.prototype.setRateLimit = function (rateLimit) {
    this.rate_limit = [rateLimit, rateLimit, rateLimit];
};
module.exports.AxisCommandMode = AxisCommandMode;
module.exports.StatusFieldBitMask = StatusFieldBitMask;
module.exports.MotionLimiterMode = MotionLimiterMode;
module.exports.SingleAxisState = SingleAxisState;
module.exports.AxisState = AxisState;
module.exports.SingleAxisCommand = SingleAxisCommand;
module.exports.AxisCommand = AxisCommand;
module.exports.LEDCommand = LEDCommand;

},{"../ifr-core/SLog":57,"../ifr-core/Time":58}],26:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var MotionInterface = require("./MotionInterface");
var TimerTools = require("../ifr-core/TimerTools");
/**
 * Timeline output connecting to the body service.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var BodyOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    /** @type {Clock} */
    this.clock = clock;
    /** @type {RobotInfo} */
    this.robotInfo = robotInfo;
    /** @type {Time} */
    this.outputTime = null;
    /** @type {Pose} */
    this.outputPose = null;
    /** @type {number} */
    this.reactionTime = 1 / 50;
    /** @type {number} */
    this.velocityCalcDelta = 1 / 50;
    /** @type {MotionInterface} */
    this.motionInterface = new MotionInterface(bodyServiceURL, sessionToken);
    /** @type {string[]} */
    this.dofNames = this.motionInterface.getMotionDOFNames();
    /** @type {boolean[]} */
    this.enabledArray = [];
    for (var i = 0; i < this.dofNames.length; i++) {
        this.enabledArray.push(startEnabled !== undefined ? startEnabled : false);
    }
    /** @type {boolean} */
    this.paused = false;
    /** @type {Function[]} */
    this.infoListeners = [];
    this.updateHandle = null;
    if (updateIntervalMillis) {
        var self = this;
        this.updateHandle = TimerTools.setInterval(function () {
            self.update();
        }, updateIntervalMillis);
    }
    this.cachedTargets = null;
};
/**
 * @return {string[]}
 */
BodyOutput.prototype.getMotionDOFNames = function () {
    return this.dofNames;
};
/**
 * @return {boolean}
 */
BodyOutput.prototype.isConnected = function () {
    return this.motionInterface.isConnected();
};
/**
 * Sets whether or not motor output is enabled.
 * Can specify a single boolean (for all motion DOFs collectively) or an
 * array of booleans (for each individual motion DOF).
 * @param {boolean|boolean[]} enabled
 */
BodyOutput.prototype.setEnabled = function (enabled) {
    for (var i = 0; i < this.enabledArray.length; i++) {
        this.enabledArray[i] = (enabled instanceof Array) ? enabled[i] : enabled;
    }
};
/**
 * Pauses or unpauses motor output.  No commands will be issued to the body service while paused.
 * @param {boolean} shouldPause - True if motor output should pause, false if it should resume.
 * @param {function} [callback] - called when operation completes.
 */
BodyOutput.prototype.setPaused = function (shouldPause, callback) {
    this.paused = shouldPause;
    if (callback !== null && callback !== undefined) {
        callback();
    }
};
/**
 * @return {boolean}
 */
BodyOutput.prototype.isPaused = function () {
    return this.paused;
};
/**
 * @return {MotionInterface}
 */
BodyOutput.prototype.getMotionInterface = function () {
    return this.motionInterface;
};
/**
 * Adds an info listener callback.
 * @param {Function} infoListener
 */
BodyOutput.prototype.addInfoListener = function (infoListener) {
    this.infoListeners.push(infoListener);
};
/**
 * @param {Time} time
 * @param {Pose} pose
 * @param {Object} blackboard
 */
BodyOutput.prototype.handleOutput = function (time, pose, blackboard) {
    this.outputTime = time;
    this.outputPose = pose;
    this.computeTargetsForTime(time, true);
};
BodyOutput.prototype.update = function () {
    // override in subclass
};
/**
 * @param {Time} targetTime
 * @param {boolean} [recomputeTargets]
 * @return {Object[]}
 */
BodyOutput.prototype.computeTargetsForTime = function (targetTime, recomputeTargets) {
    if (!recomputeTargets) {
        return this.cachedTargets;
    }
    if (this.outputPose !== null) {
        var targetPose = this.outputPose;
        var targets = [];
        for (var i = 0; i < this.dofNames.length; i++) {
            var targetAngle = targetPose.get(this.dofNames[i], 0);
            var velocity = targetPose.get(this.dofNames[i], 1);
            if (Math.abs(velocity) < 0.01) {
                velocity = 0;
            }
            targets.push({ position: targetAngle, velocity: velocity });
        }
        this.cachedTargets = targets;
        return targets;
    }
    else {
        this.cachedTargets = null;
        return null;
    }
};
/**
 * Permanently disables this output and stops all associated computation.
 */
BodyOutput.prototype.dispose = function () {
    this.motionInterface.close();
    if (this.updateHandle !== null) {
        TimerTools.clearInterval(this.updateHandle);
        this.updateHandle = null;
    }
    this.robotInfo = null;
    this.outputPose = null;
};
module.exports = BodyOutput;

},{"../ifr-core/TimerTools":59,"./MotionInterface":35}],27:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var BodyOutput = require("./BodyOutput");
var Clock = require("../ifr-core/Clock");
/**
 * Timeline output connecting to the body service.
 * Communicates with the (remote) position-velocity control mode running on the body boards.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @param {number} [idleModeSwitchTime=0.3] - switch to zero velocity idle after this many seconds of static position commands (0 to never switch to idle)
 * @constructor
 */
var BodyPosVelComboOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken, idleModeSwitchTime) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
    this.idleModeSwitchTime = 0.3;
    if (idleModeSwitchTime != null) {
        this.idleModeSwitchTime = idleModeSwitchTime;
    }
    /** @type {Time} */
    this.startTime = null;
    /** @type {SingleAxisState[]} */
    this.initialStates = [];
    /** @type {Time[]} */
    this.lastMovingCommandTime = [];
    /** @type {number} */
    this.movingEpsilon = 0.0001;
};
BodyPosVelComboOutput.prototype = Object.create(BodyOutput.prototype);
BodyPosVelComboOutput.prototype.constructor = BodyOutput;
/**
 * Pauses or unpauses motor output.  No commands will be issued to the body service while paused.
 * @param {boolean} shouldPause - True if motor output should pause, false if it should resume.
 * @override
 */
BodyPosVelComboOutput.prototype.setPaused = function (shouldPause) {
    BodyOutput.prototype.setPaused.call(this, shouldPause);
    if (shouldPause) {
        this.startTime = null;
        this.initialStates = [];
        this.lastMovingCommandTime = [];
    }
};
BodyPosVelComboOutput.prototype.update = function () {
    var i;
    /** @type {Time} */
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (targets !== null && this.motionInterface.isConnected() && !this.isPaused()) {
        if (this.startTime === null) {
            //grab the initial states and start time after we are first connected for fade-in
            this.startTime = currentTime;
            for (i = 0; i < this.dofNames.length; i++) {
                this.initialStates.push(this.motionInterface.getState(this.dofNames[i]));
            }
            //init motion-stopped idle trackers
            for (i = 0; i < this.dofNames.length; i++) {
                this.lastMovingCommandTime.push(Clock.currentTime());
            }
        }
        var fadeAlpha = 1;
        var fadeSecondsMax = 8;
        if (currentTime.subtract(this.startTime) < fadeSecondsMax) {
            var maxDistance = 0;
            for (i = 0; i < this.dofNames.length; i++) {
                if (Math.abs(this.initialStates[i].pos) > maxDistance) {
                    maxDistance = Math.abs(this.initialStates[i].pos);
                }
            }
            maxDistance = Math.max(0, Math.min(Math.PI, maxDistance));
            var fadeSeconds = fadeSecondsMax * (maxDistance / Math.PI);
            fadeAlpha = currentTime.subtract(this.startTime) / fadeSeconds;
            fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
        }
        for (i = 0; i < this.dofNames.length; i++) {
            var accelerationLimit = 50;
            var command;
            if (fadeAlpha < 1) {
                command = [
                    targets[i].velocity * fadeAlpha,
                    targets[i].position * fadeAlpha + this.initialStates[i].pos * (1 - fadeAlpha)
                ];
                this.lastMovingCommandTime[i] = Clock.currentTime();
            }
            else {
                command = [targets[i].velocity, targets[i].position];
            }
            if (Math.abs(command[0]) > this.movingEpsilon || fadeAlpha < 1) {
                //prevent idle if starting up or moving more than epsilon speed
                this.lastMovingCommandTime[i] = Clock.currentTime();
            }
            var sendVelocity;
            var sendPosition;
            if (this.idleModeSwitchTime > 0 && Clock.currentTime().subtract(this.lastMovingCommandTime[i]) > this.idleModeSwitchTime) {
                //idle mode (assumed to be at target position, no desired velocity)  send velocity mode 0, or limp if disabled.
                this.motionInterface.setCommand(this.dofNames[i], this.enabledArray[i] ? BodyData.AxisCommandMode.VELOCITY : BodyData.AxisCommandMode.BRAKE, 0, null, accelerationLimit, null);
                sendVelocity = 0;
                sendPosition = 0.25; //undefined, not sent
            }
            else {
                //regular mode.  send posvel command, or limp if disabled.
                var commandMode = this.enabledArray[i] ? BodyData.AxisCommandMode.POS_VEL : BodyData.AxisCommandMode.BRAKE;
                //send only 1 value if we're in "limp" mode
                this.motionInterface.setCommand(this.dofNames[i], commandMode, commandMode === BodyData.AxisCommandMode.POS_VEL ? command : 0, null, accelerationLimit, null);
                sendVelocity = command[0];
                sendPosition = command[1];
            }
            if (this.infoListeners.length > 0) {
                var state = this.motionInterface.getState(this.dofNames[i]);
                var info = {
                    dofName: this.dofNames[i],
                    timestamp: currentTime,
                    observedPosition: state.pos,
                    targetPosition: sendPosition,
                    observedVelocity: state.vel,
                    commandVelocity: sendVelocity,
                    refVelocity: state.ref
                };
                for (var c = 0; c < this.infoListeners.length; c++) {
                    this.infoListeners[c](info);
                }
            }
        }
        this.motionInterface.sendCommand();
    }
    else {
        // reset initial states for soft resume
        this.startTime = null;
        this.initialStates = [];
        this.lastMovingCommandTime = [];
    }
};
module.exports = BodyPosVelComboOutput;

},{"../ifr-core/Clock":53,"./BodyData":25,"./BodyOutput":26}],28:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var BodyOutput = require("./BodyOutput");
var CyclicMath = require("../ifr-motion/base/CyclicMath");
var slog = require("../ifr-core/SLog");
var ErrorLogHelper = require("./ErrorLogHelper");
var bodyChannel = "BODY_INTERFACE";
/**
 * Enum values for single axis status
 * @enum {number}
 */
var ControlState = {
    /**
     * In this stage we are waiting for an opportunity to start controlling the motors.
     * We will wait until we are connected, there is low motion, there is no timeout, there is no error.
     * We will not exit this stage if we are paused.
     * We enter this stage on startup, on setPause(false), or on auto-recovery after an error/lockout/timeout.
     * We exit this stage to RESUMING when all the criteria of connected, low motion, no timeout, etc. are met
     */
    ESTABLISHING: "ESTABLISHING",
    /**
     * Once we are done ESTABLISHING, we enter RESUMING.  We are in control but not at the right positions, so this
     * stage modifies the target commands to smoothly reduce the error from where we started, rather than
     * commanding the actual target immediately, which would jerk the motor quickly to the target.
     */
    RESUMING: "RESUMING",
    /**
     * We are in normal operating mode; pass through all commands to the motors.
     */
    RUNNING: "RUNNING"
};
/**
 * Timeline output connecting to the body service.
 * Communicates with the (remote) position-velocity control mode running on the body boards.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var BodyPosVelOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
    /** @type {Time} */
    this.startTime = null;
    /** @type {number[]} */
    this.initialDeltas = [];
    /** @type {boolean} */
    this.error = false;
    /** @type {boolean} */
    this.goLimpOnError = true;
    /** @type {boolean} */
    this.goLimpOnTimeout = true;
    /** @type {boolean} */
    this.goLimpOnDisconnect = true;
    /** @type {boolean} */
    this.goLimpOnUnIndexed = true;
    /** @type {boolean} */
    this.errorsAreSticky = false;
    /** @type {ControlState} */
    this.controlState = ControlState.ESTABLISHING;
    /** @type {number} */
    this.fadeSecondsMax = 8;
    /** @type {number} */
    this.fadeSeconds = 0;
    /** @type {Array.<function>} */
    this.unPauseCallbacks = [];
    /**
     * The interval for logging about ongoing/continuous error conditions in seconds
     * @type {number}
     */
    this.errorComplaintInterval = 5;
    /** @type {MotionLimiterMode} */
    this.latestLimiterMode = BodyData.MotionLimiterMode.OK;
    /** @type {Time} */
    this.limiterActivationTime = null;
    /** @type {number} */
    this.limiterActivationTolerance = 0.1;
    /** @type {boolean} */
    this.didLogLimiterWarning = false;
    /** @type {boolean} */
    this.everBeenIndexed = false;
    this.errorLogHelper = new ErrorLogHelper(this.clock, bodyChannel, this.errorComplaintInterval, this.errorComplaintInterval);
};
BodyPosVelOutput.prototype = Object.create(BodyOutput.prototype);
BodyPosVelOutput.prototype.constructor = BodyOutput;
/**
 *
 * @param {ControlState} controlState
 * @private
 */
BodyPosVelOutput.prototype._setControlState = function (controlState) {
    if (this.controlState !== controlState) {
        slog(bodyChannel, "state changed: " + this.controlState + " -> " + controlState);
        this.controlState = controlState;
    }
};
/**
 * Pauses or unpauses motor output.  No commands will be issued to the body service while paused.
 * @param {boolean} shouldPause - True if motor output should pause, false if it should resume.
 * @param {function} [callback] - called when operation completes.  called immediately for setPaused(true), called after we resume control for setPaused(false)
 * @override
 */
BodyPosVelOutput.prototype.setPaused = function (shouldPause, callback) {
    slog(bodyChannel, "setPause:" + shouldPause + " has callback:" + (callback != null));
    if (!shouldPause && this.isPaused()) {
        this._setControlState(ControlState.ESTABLISHING);
    }
    BodyOutput.prototype.setPaused.call(this, shouldPause, null); //don't pass callback to super, we will handle it
    if (callback !== null && callback !== undefined) {
        if (shouldPause) {
            //pausing, happens immediately
            slog(bodyChannel, " done setPause:true calling back");
            callback();
        }
        else {
            if (this.controlState === ControlState.RUNNING) {
                //unpausing, but we are already unpaused
                slog(bodyChannel, " done setPause:false calling back (immediate)");
                callback();
            }
            else {
                this.unPauseCallbacks.push(callback);
            }
        }
    }
};
BodyPosVelOutput.prototype.update = function () {
    var shouldCallUnPauseCallbacks = false;
    var i;
    /** @type {Time} */
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (this.motionInterface.hasLockout() || this.motionInterface.hasFault()) {
        this.error = true;
        if (this.goLimpOnError) {
            if (this.controlState !== ControlState.ESTABLISHING) {
                slog(bodyChannel, "disabling due to:" +
                    (this.motionInterface.hasLockout() ? " lockout(" + this.motionInterface.getLockout() + ")," : "") +
                    (this.motionInterface.hasFault() ? " fault(" + this.motionInterface.getFaults() + ")," : ""));
            }
            this._setControlState(ControlState.ESTABLISHING);
        }
    }
    else if (this.error && !this.errorsAreSticky) {
        //error is no longer being reported, but we have our error flag set from a recent report
        //AND, we have the setting that errors are NOT sticky, so we should clear the error flag.
        // clear error condition
        this.error = false;
    }
    var timeout = false;
    if (this.motionInterface.hasTimeout()) {
        timeout = true;
        if (this.goLimpOnTimeout) {
            if (this.controlState !== ControlState.ESTABLISHING) {
                slog(bodyChannel, "disabling due to timeout");
            }
            this._setControlState(ControlState.ESTABLISHING);
        }
    }
    var connected = true;
    if (!this.motionInterface.isConnected()) {
        connected = false;
        if (this.goLimpOnDisconnect) {
            if (this.controlState !== ControlState.ESTABLISHING) {
                slog(bodyChannel, "disabling due to not connected");
            }
            this._setControlState(ControlState.ESTABLISHING);
        }
    }
    var indexed;
    if (this.motionInterface.allIndexed()) {
        indexed = true;
        this.everBeenIndexed = true;
    }
    else {
        indexed = false;
        if (this.goLimpOnUnIndexed) {
            if (this.controlState !== ControlState.ESTABLISHING) {
                slog(bodyChannel, "disabling due to not indexed (" + this.motionInterface.getIndexStatuses() + ")");
            }
            this._setControlState(ControlState.ESTABLISHING);
        }
    }
    var limiterMode = this.motionInterface.getLimiterMode();
    if (limiterMode !== null && limiterMode !== this.latestLimiterMode) {
        this.limiterActivationTime = null;
        if (limiterMode === BodyData.MotionLimiterMode.APPROACHING_LIMIT) {
            //slog(bodyChannel, "motion approaching dynamic limits, motion limiting will be applied");
        }
        else if (limiterMode === BodyData.MotionLimiterMode.EXCEEDING_LIMIT) {
            //slog(bodyChannel, "motion exceeds dynamic limits, motion limiting is being applied");
            this.limiterActivationTime = currentTime;
        }
        else if (limiterMode === BodyData.MotionLimiterMode.OK) {
            if (this.didLogLimiterWarning) {
                slog(bodyChannel, "motion is back within normal limits, no limiting is being applied");
                this.didLogLimiterWarning = false;
            }
        }
        else if (limiterMode === BodyData.MotionLimiterMode.DISABLED) {
            slog(bodyChannel, "warning: dynamic motion limiter is disabled");
        }
        else if (limiterMode === BodyData.MotionLimiterMode.UNINDEXED) {
            //slog(bodyChannel, "dynamic motion limiter is activating due to not indexed");
            //this.didLogLimiterWarning = true;
        }
        this.latestLimiterMode = limiterMode;
    }
    if (this.limiterActivationTime !== null && currentTime.subtract(this.limiterActivationTime) > this.limiterActivationTolerance) {
        slog(bodyChannel, "motion exceeds dynamic limits, motion limiting is being applied");
        this.didLogLimiterWarning = true;
        this.limiterActivationTime = null;
    }
    if (!this.isPaused()) {
        //first we see if we should update our ControlState out of establishing.
        //do this if there are no errors, and we're not moving, and the target is not moving
        if (this.controlState === ControlState.ESTABLISHING) {
            if (connected && !this.error && !timeout && indexed) {
                //we're clear on the various error conditions.
                var okToSoftStart = true;
                var currentState;
                //check if it is ok to soft start (no joint is moving fast)
                for (i = 0; i < this.dofNames.length; i++) {
                    currentState = this.motionInterface.getState(this.dofNames[i]);
                    var targetState = targets[i];
                    var motionLimit = 0.2;
                    if (Math.abs(currentState.vel) > motionLimit || Math.abs(targetState.velocity) > motionLimit) {
                        okToSoftStart = false;
                        this.errorLogHelper.noteMotionLockout(motionLimit, currentState, targetState);
                        break;
                    }
                }
                if (okToSoftStart) {
                    this._setControlState(ControlState.RESUMING);
                    //clear our error log print flags, we're operational
                    this.errorLogHelper.operationResumed();
                    //init the resume state
                    this.startTime = currentTime;
                    this.initialDeltas = [];
                    var maxDelta = 0;
                    for (i = 0; i < this.dofNames.length; i++) {
                        currentState = this.motionInterface.getState(this.dofNames[i]);
                        var currentTarget = CyclicMath.closestEquivalentRotation(targets[i].position, currentState.pos);
                        var thisDelta = currentTarget - currentState.pos;
                        this.initialDeltas.push(thisDelta);
                        if (Math.abs(thisDelta) > maxDelta) {
                            maxDelta = Math.abs(thisDelta);
                        }
                    }
                    this.fadeSeconds = this.fadeSecondsMax * (maxDelta / Math.PI);
                }
            }
            else {
                this.errorLogHelper.noteError(connected, this.error, timeout, indexed, this.everBeenIndexed, this.errorsAreSticky, this.motionInterface);
            }
        }
        var fadeAlpha = 1;
        if (this.controlState === ControlState.RESUMING) {
            if (this.fadeSeconds < 0.01) {
                fadeAlpha = 1; //no time necessary. shouldn't compute for zero time cases (divide by zero)
            }
            else {
                fadeAlpha = currentTime.subtract(this.startTime) / this.fadeSeconds;
                fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
            }
            if (fadeAlpha >= 1) {
                this._setControlState(ControlState.RUNNING);
                shouldCallUnPauseCallbacks = true;
            }
        }
        for (i = 0; i < this.dofNames.length; i++) {
            /** @type {AxisCommandMode} */
            var commandMode = BodyData.AxisCommandMode.BRAKE;
            if (this.enabledArray[i] &&
                (this.controlState === ControlState.RUNNING || this.controlState === ControlState.RESUMING)) {
                commandMode = BodyData.AxisCommandMode.POS_VEL;
            }
            var accelerationLimit = 50;
            var command;
            if (this.controlState === ControlState.RESUMING) {
                var velocityCatchupContribution = this.initialDeltas[i] / this.fadeSeconds;
                //This check is to avoid adding miniscule catchup velocities;
                // motor controller is making an audible tone when this happens, which we want to avoid.
                if (Math.abs(velocityCatchupContribution) < 0.1) {
                    velocityCatchupContribution = 0;
                }
                command = [
                    //targets[i].velocity * fadeAlpha, //option 1: fade velocity in? velocity won't quite match positions
                    targets[i].velocity + velocityCatchupContribution,
                    targets[i].position - this.initialDeltas[i] * (1 - fadeAlpha)
                ];
            }
            else {
                command = [targets[i].velocity, targets[i].position];
            }
            //bring position into -PI to PI
            command[1] = CyclicMath.closestEquivalentRotation(command[1], 0);
            //send only 1 value if we're in "limp" mode
            this.motionInterface.setCommand(this.dofNames[i], commandMode, commandMode === BodyData.AxisCommandMode.POS_VEL ? command : 0, null, accelerationLimit, null);
            if (this.infoListeners.length > 0) {
                var state = this.motionInterface.getState(this.dofNames[i]);
                if (state != null) {
                    var info = {
                        dofName: this.dofNames[i],
                        timestamp: currentTime,
                        observedPosition: state.pos,
                        targetPosition: command[1],
                        observedVelocity: state.vel,
                        commandVelocity: command[0],
                        refVelocity: state.ref
                    };
                    for (var c = 0; c < this.infoListeners.length; c++) {
                        this.infoListeners[c](info);
                    }
                }
            }
        }
        this.motionInterface.sendCommand();
    } //end !paused
    if (shouldCallUnPauseCallbacks) {
        slog(bodyChannel, " done enabling, notifying " + this.unPauseCallbacks.length + " \"setPause:false\" listeners");
        while (this.unPauseCallbacks.length > 0) {
            this.unPauseCallbacks.shift()();
        }
    }
};
module.exports = BodyPosVelOutput;

},{"../ifr-core/SLog":57,"../ifr-motion/base/CyclicMath":70,"./BodyData":25,"./BodyOutput":26,"./ErrorLogHelper":32}],29:[function(require,module,exports){
/**
 * @author jonathan ross
 */
"use strict";
var BodyOutput = require("./BodyOutput");
var BodyPositionOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
};
BodyPositionOutput.prototype = Object.create(BodyOutput.prototype);
BodyPositionOutput.prototype.constructor = BodyOutput;
BodyPositionOutput.prototype.update = function () {
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (targets !== null && this.motionInterface.isConnected() && !this.isPaused()) {
        for (var i = 0; i < this.dofNames.length; i++) {
            var position = targets[i].position;
            this.motionInterface.setCommand(this.dofNames[i], 0, position, null, null, null);
        }
        this.motionInterface.sendCommand();
    }
};
module.exports = BodyPositionOutput;

},{"./BodyOutput":26}],30:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var BodyOutput = require("./BodyOutput");
/**
 * Timeline output connecting to the body service.
 * Communicates with the (remote) trajectory control mode running on the body boards.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var BodyTrajectoryOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
};
BodyTrajectoryOutput.prototype = Object.create(BodyOutput.prototype);
BodyTrajectoryOutput.prototype.constructor = BodyOutput;
BodyTrajectoryOutput.prototype.update = function () {
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime) && !this.isPaused());
    if (targets !== null && this.motionInterface.isConnected()) {
        for (var i = 0; i < this.dofNames.length; i++) {
            var commandMode = this.enabledArray[i] ? BodyData.AxisCommandMode.TRAJECTORY : BodyData.AxisCommandMode.BRAKE;
            var interceptTime = 0.3;
            var accelerationLimit = 30;
            var command = [targets[i].velocity, targets[i].position, interceptTime, 0];
            //send only 1 value if we're in "limp" mode
            this.motionInterface.setCommand(this.dofNames[i], commandMode, commandMode === BodyData.AxisCommandMode.TRAJECTORY ? command : 0, null, accelerationLimit, null);
            if (this.infoListeners.length > 0) {
                var state = this.motionInterface.getState(this.dofNames[i]);
                var info = {
                    dofName: this.dofNames[i],
                    timestamp: currentTime,
                    observedPosition: state.pos,
                    targetPosition: targets[i].position,
                    observedVelocity: state.vel,
                    commandVelocity: targets[i].velocity
                };
                for (var c = 0; c < this.infoListeners.length; c++) {
                    this.infoListeners[c](info);
                }
            }
        }
        this.motionInterface.sendCommand();
    }
};
module.exports = BodyTrajectoryOutput;

},{"./BodyData":25,"./BodyOutput":26}],31:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var BodyOutput = require("./BodyOutput");
var PVController = require("../ifr-motion/feedback/PVController");
/**
 * Timeline output connecting to the body service.
 * Creates a local set of position-velocity feedback controllers wrapping
 * the (remote) velocity control mode on the body boards.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var BodyVelocityOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
    /** @type {PVController[]} */
    this.feedbackControllers = [];
    for (var i = 0; i < this.dofNames.length; i++) {
        this.feedbackControllers.push(new PVController());
    }
};
BodyVelocityOutput.prototype = Object.create(BodyOutput.prototype);
BodyVelocityOutput.prototype.constructor = BodyOutput;
BodyVelocityOutput.prototype.update = function () {
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (targets !== null && this.motionInterface.isConnected() && !this.isPaused()) {
        for (var i = 0; i < this.dofNames.length; i++) {
            this.feedbackControllers[i].setTarget(currentTime, targets[i].position, targets[i].velocity);
            this.feedbackControllers[i].calculateForTime(currentTime);
            var commandVelocity = this.feedbackControllers[i].getCommandVelocity();
            var commandAcceleration = this.feedbackControllers[i].getCommandAcceleration();
            var commandMode = this.enabledArray[i] ? BodyData.AxisCommandMode.VELOCITY : BodyData.AxisCommandMode.BRAKE;
            this.motionInterface.setCommand(this.dofNames[i], commandMode, commandVelocity, null, commandAcceleration, null);
            var state = this.motionInterface.getState(this.dofNames[i]);
            this.feedbackControllers[i].acceptFeedback(currentTime, state.pos, state.vel, state.ref);
            if (this.infoListeners.length > 0) {
                var info = {
                    dofName: this.dofNames[i],
                    timestamp: currentTime,
                    observedPosition: state.pos,
                    targetPosition: targets[i].position,
                    observedVelocity: state.vel,
                    commandVelocity: commandVelocity
                };
                for (var c = 0; c < this.infoListeners.length; c++) {
                    this.infoListeners[c](info);
                }
            }
        }
        this.motionInterface.sendCommand();
    }
};
module.exports = BodyVelocityOutput;

},{"../ifr-motion/feedback/PVController":93,"./BodyData":25,"./BodyOutput":26}],32:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var slog = require("../ifr-core/SLog");
/**
 *
 * @param {Clock} clock
 * @param {string} printChannel
 * @param {number} motionPrintoutInterval
 * @param {number} errorPrintoutInterval
 * @constructor
 */
var ErrorLogHelper = function (clock, printChannel, motionPrintoutInterval, errorPrintoutInterval) {
    /** @type {Clock} */
    this.clock = clock;
    this.channel = printChannel;
    this.motionInterval = motionPrintoutInterval;
    this.errorInterval = errorPrintoutInterval;
    //a time to use as the reset time, old enough to cause any message to refresh printing
    this.resetTime = this.clock.currentTime().add(-Math.max(this.motionInterval, this.errorInterval));
    this.lastMotionPrintTime = this.resetTime;
    this.lastErrorPrintTime = this.resetTime;
    this.lastErrorHadDisconnected = false;
    this.lastErrorHadFault = false;
    this.lastErrorHadLockout = false;
    this.lastErrorHadTimeout = false;
    this.lastErrorHadUnindexed = false;
};
/**
 *
 * @param {number} motionLimit
 * @param {{vel:number}} currentState
 * @param {{velocity:number}} targetState
 */
ErrorLogHelper.prototype.noteMotionLockout = function (motionLimit, currentState, targetState) {
    var curTime = this.clock.currentTime();
    if (curTime.subtract(this.lastMotionPrintTime) > this.motionInterval) {
        var message = "staying in ESTABLISHING due motion > " + motionLimit + ",";
        if (Math.abs(currentState.vel) > motionLimit) {
            message += " physical:" + Math.abs(currentState.vel);
        }
        if (Math.abs(targetState.velocity) > motionLimit) {
            message += " target:" + Math.abs(targetState.velocity);
        }
        slog(this.channel, message);
        this.lastMotionPrintTime = curTime;
    }
};
/**
 *
 * @param {boolean} connected
 * @param {boolean} hasError
 * @param {boolean} hasTimeout
 * @param {boolean} isIndexed
 * @param {boolean} hasEverBeenIndexed
 * @param {boolean} errorsSticky
 * @param {MotionInterface} motionInterface
 */
ErrorLogHelper.prototype.noteError = function (connected, hasError, hasTimeout, isIndexed, hasEverBeenIndexed, errorsSticky, motionInterface) {
    var curTime = this.clock.currentTime();
    if (curTime.subtract(this.lastErrorPrintTime) > this.errorInterval) {
        //skip printout if only issue is that we are unindexed and have never been
        //actually, we don't need this check; if our only issue is unindexed, we'll print it once because
        //state will not be different next time
        //if(!connected || hasError || hasTimeout || (!isIndexed && hasEverBeenIndexed)) {
        //check if there is a different in error state
        var differentState = false;
        if ((!connected) !== this.lastErrorHadDisconnected) {
            this.lastErrorHadDisconnected = !connected;
            differentState = true;
        }
        if (motionInterface.hasFault() !== this.lastErrorHadFault) {
            this.lastErrorHadFault = motionInterface.hasFault();
            differentState = true;
        }
        if (motionInterface.hasLockout() !== this.lastErrorHadLockout) {
            this.lastErrorHadLockout = motionInterface.hasLockout();
            differentState = true;
        }
        if (hasTimeout !== this.lastErrorHadTimeout) {
            this.lastErrorHadTimeout = hasTimeout;
            differentState = true;
        }
        if ((!isIndexed) !== this.lastErrorHadUnindexed) {
            this.lastErrorHadUnindexed = !isIndexed;
            differentState = true;
        }
        if (differentState) {
            slog(this.channel, "staying in ESTABLISHING due to:" +
                ((!connected) ? " disconnected," : "") +
                (motionInterface.hasFault() ? " fault(" + motionInterface.getFaults() + ")," : "") +
                (motionInterface.hasLockout() ? " lockout(" + motionInterface.getLockout() + ")," : "") +
                (hasTimeout ? " timeout," : "") +
                (!isIndexed ? " unindexed(" + motionInterface.getIndexStatuses() + ")," : "") +
                (errorsSticky && hasError ? " errorsSticky(" + errorsSticky + ")," : ""));
            this.lastErrorPrintTime = curTime;
        }
        //}
    }
};
ErrorLogHelper.prototype.operationResumed = function () {
    this.lastMotionPrintTime = this.resetTime;
    this.lastErrorPrintTime = this.resetTime;
    this.lastErrorHadDisconnected = false;
    this.lastErrorHadFault = false;
    this.lastErrorHadLockout = false;
    this.lastErrorHadTimeout = false;
    this.lastErrorHadUnindexed = false;
};
module.exports = ErrorLogHelper;

},{"../ifr-core/SLog":57}],33:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var Clock = require("../ifr-core/Clock");
var ReconnectingWebSocket = require("../ifr-core/ReconnectingWebSocket");
/**
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var LEDInterface = function (bodyServiceURL, sessionToken) {
    /** @type {LEDCommand} */
    this.command = new BodyData.LEDCommand();
    this.command.color = [0, 0, 0];
    this.command.setRateLimit(50);
    /** @type {ReconnectingWebSocket} */
    this.commandSocket = new ReconnectingWebSocket(bodyServiceURL + "/led_command", sessionToken, 3000, "BODY");
};
/**
 * @param {number[]} rgbValue - RGB color value array, values in percentage of maximum [0.0, 1.0]
 * @param {number} rateLimit - maximum rate of change of color values, in percent/second
 * @return {boolean} true if the command was set successfully
 */
LEDInterface.prototype.setCommand = function (rgbValue, rateLimit) {
    for (var i = 0; i < 3; i++) {
        this.command.color[i] = rgbValue[i];
    }
    this.command.setRateLimit(rateLimit);
    return true;
};
/**
 * @return {boolean} true if the command was sent successfully
 */
LEDInterface.prototype.sendCommand = function () {
    if (this.isConnected()) {
        this.command.setTimestamp(Clock.currentTime());
        var cmd = JSON.stringify(this.command);
        this.commandSocket.send(cmd);
        return true;
    }
    else {
        return false;
    }
};
/**
 * @return {boolean} true if the LED interface is connected
 */
LEDInterface.prototype.isConnected = function () {
    return this.commandSocket.isConnected();
};
LEDInterface.prototype.close = function () {
    this.commandSocket.close();
};
module.exports = LEDInterface;

},{"../ifr-core/Clock":53,"../ifr-core/ReconnectingWebSocket":56,"./BodyData":25}],34:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var LEDInterface = require("./LEDInterface");
var TimerTools = require("../ifr-core/TimerTools");
/**
 * Timeline output connecting to the LED service.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {boolean} [startEnabled] - optional, if true, start up with LED output enabled (defaults to true)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var LEDOutput = function (clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    /** @type {Clock} */
    this.clock = clock;
    /** @type {RobotInfo} */
    this.robotInfo = robotInfo;
    /** @type {Time} */
    this.outputTime = null;
    /** @type {Pose} */
    this.outputPose = null;
    /** @type {number} */
    this.reactionTime = 1 / 50;
    /** @type {number} */
    this.velocityCalcDelta = 1 / 50;
    /** @type {number} */
    this.rateLimit = 50;
    /** @type {LEDInterface} */
    this.ledInterface = new LEDInterface(bodyServiceURL, sessionToken);
    /** @type {string[]} */
    this.dofNames = this.robotInfo.getDOFSet("LED").getDOFs();
    /** @type {boolean} */
    this.enabled = startEnabled !== undefined ? startEnabled : true;
    this.updateHandle = null;
    if (updateIntervalMillis) {
        var self = this;
        this.updateHandle = TimerTools.setInterval(function () {
            self.update();
        }, updateIntervalMillis);
    }
};
/**
 * @return {boolean}
 */
LEDOutput.prototype.isConnected = function () {
    return this.ledInterface.isConnected();
};
/**
 * Sets whether or not LED output is enabled.
 * @param {boolean} enabled
 */
LEDOutput.prototype.setEnabled = function (enabled) {
    this.enabled = enabled;
};
/**
 * @param {Time} time
 * @param {Pose} pose
 * @param {Object} blackboard
 */
LEDOutput.prototype.handleOutput = function (time, pose, blackboard) {
    this.outputTime = time;
    this.outputPose = pose;
};
LEDOutput.prototype.update = function () {
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (targets !== null && this.enabled && this.ledInterface.isConnected()) {
        var rgbValue = [];
        for (var i = 0; i < this.dofNames.length; i++) {
            rgbValue.push(targets[i].position);
        }
        this.ledInterface.setCommand(rgbValue, this.rateLimit);
        this.ledInterface.sendCommand();
    }
};
/**
 * @param {Time} targetTime
 * @return {Object[]}
 */
LEDOutput.prototype.computeTargetsForTime = function (targetTime) {
    if (this.outputPose !== null) {
        var targetPose = this.outputPose;
        var targets = [];
        for (var i = 0; i < this.dofNames.length; i++) {
            var targetValue = targetPose.get(this.dofNames[i], 0);
            var velocity = targetPose.get(this.dofNames[i], 1);
            targets.push({ position: targetValue, velocity: velocity });
        }
        return targets;
    }
    else {
        return null;
    }
};
/**
 * Permanently disables this output and stops all associated computation.
 */
LEDOutput.prototype.dispose = function () {
    this.ledInterface.close();
    if (this.updateHandle !== null) {
        TimerTools.clearInterval(this.updateHandle);
        this.updateHandle = null;
    }
    this.robotInfo = null;
    this.outputPose = null;
};
module.exports = LEDOutput;

},{"../ifr-core/TimerTools":59,"./LEDInterface":33}],35:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyData = require("./BodyData");
var Clock = require("../ifr-core/Clock");
var ReconnectingWebSocket = require("../ifr-core/ReconnectingWebSocket");
var slog = require("../ifr-core/SLog");
var bodyChannel = "BODY_INTERFACE";
/**
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {string} [sessionToken] - optional session security token
 * @param {string} [baseDOFName] - base DOF name (optional)
 * @param {string} [middleDOFName] - middle DOF name (optional)
 * @param {string} [neckDOFName] - neck DOF name (optional)
 * @constructor
 */
var MotionInterface = function (bodyServiceURL, sessionToken, baseDOFName, middleDOFName, neckDOFName) {
    var baseDOF = baseDOFName || "bottomSection_r";
    var middleDOF = middleDOFName || "middleSection_r";
    var neckDOF = neckDOFName || "topSection_r";
    /** @type {Object.<string, string>} */
    this.dofToAxis = {};
    this.dofToAxis[baseDOF] = "pelvis";
    this.dofToAxis[middleDOF] = "torso";
    this.dofToAxis[neckDOF] = "neck";
    /** @type string[] */
    this.dofNames = [baseDOF, middleDOF, neckDOF];
    /** @type {number} */
    this.stateMessageCount = 0;
    /** @type {AxisState} */
    this.latestAxisState = null;
    /** @type {AxisCommand} */
    this.command = new BodyData.AxisCommand();
    this.command.pelvis = new BodyData.SingleAxisCommand();
    this.command.torso = new BodyData.SingleAxisCommand();
    this.command.neck = new BodyData.SingleAxisCommand();
    var self = this;
    /** @type {ReconnectingWebSocket} */
    this.stateSocket = new ReconnectingWebSocket(bodyServiceURL + "/axis_state", sessionToken, 3000, "BODY");
    this.stateSocket.on("message", function (event) {
        var data = null;
        try {
            data = JSON.parse(event.data);
        }
        catch (e) {
            slog(bodyChannel, "JSON parse failed on MotionInterface incoming message: " + event.data + " error: " + e, slog.Levels.WARN);
        }
        if (data !== null) {
            var axisState = null;
            try {
                axisState = new BodyData.AxisState().setFromJson(data);
            }
            catch (e) {
                slog(bodyChannel, "AxisState creation failed on MotionInterface incoming message: " + event.data + " error: " + e, slog.Levels.WARN);
            }
            if (axisState !== null) {
                self.latestAxisState = axisState;
                self.stateMessageCount++;
            }
        }
    });
    this.stateSocket.on("close", function () {
        self.latestAxisState = null;
    });
    this.stateSocket.on("error", function () {
        self.latestAxisState = null;
    });
    /** @type {ReconnectingWebSocket} */
    this.commandSocket = new ReconnectingWebSocket(bodyServiceURL + "/axis_command", sessionToken, 3000, "BODY");
};
/**
 * @return {string[]}
 */
MotionInterface.prototype.getMotionDOFNames = function () {
    return this.dofNames;
};
/**
 * @param {string} dofName
 * @return {SingleAxisState}
 */
MotionInterface.prototype.getState = function (dofName) {
    if (!this.dofToAxis.hasOwnProperty(dofName)) {
        throw new Error("unknown motion DOF name: " + dofName);
    }
    if (this.latestAxisState !== null) {
        return this.latestAxisState[this.dofToAxis[dofName]];
    }
    else {
        return null;
    }
};
/**
 * @return {number}
 */
MotionInterface.prototype.getStateMessageCount = function () {
    return this.stateMessageCount;
};
/**
 * @param {string} dofName - DOF name
 * @param {AxisCommandMode} commandMode - command mode for the axis
 * @param {number|number[]} commandValue - command data (as defined by the given mode)
 * @param {number} [velocityLimit] - optional velocity limit in radians/second
 * @param {number} [accelerationLimit] - optional acceleration limit in radians/second^2
 * @param {number} [currentLimit] - optional current limit in amperes
 * @return {boolean} true if the command was set successfully
 */
MotionInterface.prototype.setCommand = function (dofName, commandMode, commandValue, velocityLimit, accelerationLimit, currentLimit) {
    if (!this.dofToAxis.hasOwnProperty(dofName)) {
        throw new Error("unknown motion DOF name: " + dofName);
    }
    var state = this.getState(dofName);
    if (state !== null) {
        /** @type {SingleAxisCommand} */
        var command = this.command[this.dofToAxis[dofName]];
        command.mode = commandMode;
        command.value = (commandValue instanceof Array) ? commandValue : [commandValue];
        command.vel_limit = (velocityLimit !== undefined && velocityLimit !== null) ? velocityLimit : state.vel_limit;
        command.acc_limit = (accelerationLimit !== undefined && accelerationLimit !== null) ? accelerationLimit : state.acc_limit;
        command.cur_limit = (currentLimit !== undefined && currentLimit !== null) ? currentLimit : state.cur_limit;
        return true;
    }
    else {
        return false;
    }
};
/**
 * @return {boolean} true if the command was sent successfully
 */
MotionInterface.prototype.sendCommand = function () {
    if (this.commandSocket.isConnected()) {
        this.command.setTimestamp(Clock.currentTime());
        var cmd = JSON.stringify(this.command);
        this.commandSocket.send(cmd);
        return true;
    }
    else {
        return false;
    }
};
/**
 * @return {boolean} true if the motion interface is connected
 */
MotionInterface.prototype.isConnected = function () {
    return this.latestAxisState !== null && this.commandSocket.isConnected() && this.stateSocket.isConnected();
};
/**
 * @return {boolean} - true if a system lockout condition currently exists
 */
MotionInterface.prototype.hasLockout = function () {
    return this.latestAxisState !== null && this.latestAxisState.hasLockout();
};
/**
 * @return {boolean} true if the motion interface has timeout state on at least one axis
 */
MotionInterface.prototype.hasTimeout = function () {
    return this.latestAxisState !== null && this.latestAxisState.hasTimeout();
};
/**
 * @return {boolean} true if the motion interface reports all axes indexed
 */
MotionInterface.prototype.allIndexed = function () {
    return this.latestAxisState !== null && this.latestAxisState.allIndexed();
};
/**
 * @return {number} - bitmask representing lockout conditions, e.g. system policies that prevent control of the motors. (int)
 */
MotionInterface.prototype.getLockout = function () {
    if (this.latestAxisState !== null) {
        return this.latestAxisState.getLockout();
    }
    else {
        return null;
    }
};
/**
 * @return {boolean} - true if there is currently a fault on any axis
 */
MotionInterface.prototype.hasFault = function () {
    return this.latestAxisState !== null && this.latestAxisState.hasFault();
};
/**
 * @return {number[]} - all fault fields
 */
MotionInterface.prototype.getFaults = function () {
    var faults = [];
    if (this.latestAxisState !== null) {
        for (var i = 0; i < this.dofNames.length; i++) {
            faults.push(this.latestAxisState[this.dofToAxis[this.dofNames[i]]].getFault());
        }
    }
    return faults;
};
/**
 * @return {boolean[]} - all index fields
 */
MotionInterface.prototype.getIndexStatuses = function () {
    var statuses = [];
    if (this.latestAxisState !== null) {
        for (var i = 0; i < this.dofNames.length; i++) {
            statuses.push(this.latestAxisState[this.dofToAxis[this.dofNames[i]]].isIndexed());
        }
    }
    return statuses;
};
/**
 * @return {MotionLimiterMode} - the most severe motion limiter mode being applied to any axis
 */
MotionInterface.prototype.getLimiterMode = function () {
    if (this.latestAxisState !== null) {
        return this.latestAxisState.getLimiterMode();
    }
    else {
        return null;
    }
};
MotionInterface.prototype.close = function () {
    this.stateSocket.close();
    this.commandSocket.close();
};
module.exports = MotionInterface;

},{"../ifr-core/Clock":53,"../ifr-core/ReconnectingWebSocket":56,"../ifr-core/SLog":57,"./BodyData":25}],36:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var Time = require("../ifr-core/Time");
var FileTools = require("../ifr-core/FileTools");
var MotionLog = {};
/**
 * @param {string} filename
 * @return {Function}
 */
MotionLog.createLog = function (filename) {
    var fs = "fs";
    fs = require(fs);
    var motionStream = fs.createWriteStream(filename);
    var first = true;
    return function (info) {
        if (first) {
            first = false;
        }
        else {
            motionStream.write(",\n");
        }
        motionStream.write(JSON.stringify(info));
    };
};
/**
 * Simple strategy to get data from browser without any saving; we'll log to the console with a unique prefix
 * to later be manually saved to file and loaded with loadConsoleLog
 *
 * @param {string} prefix
 * @return {Function}
 */
MotionLog.createConsoleLog = function (prefix) {
    return function (info) {
        console.log(prefix + JSON.stringify(info));
    };
};
/**
 * @param {string} filename
 * @param {Function} cb
 */
MotionLog.loadLog = function (filename, cb) {
    FileTools.loadText(filename, function (error, data) {
        if (error) {
            cb(error, null);
        }
        else {
            var infoArray = null;
            try {
                var infoString = "[" + data + "]";
                infoArray = JSON.parse(infoString);
                for (var i = 0; i < infoArray.length; i++) {
                    infoArray[i].timestamp = Time.createFromTimestamp(infoArray[i].timestamp._timestamp);
                }
            }
            catch (e) {
                cb(e, null);
            }
            cb(null, infoArray);
        }
    });
};
/**
 * Reads in a file saved from the a console log generated by createConsoleLog
 * @param {string} filename
 * @param {string} prefix
 * @param {Function} cb
 */
MotionLog.loadConsoleLog = function (filename, prefix, cb) {
    FileTools.loadText(filename, function (error, data) {
        if (error) {
            cb(error, null);
        }
        else {
            var infoArray = [];
            try {
                /** @type {string[]} */
                var lines = data.split("\n");
                for (var l = 0; l < lines.length; l++) {
                    var index = lines[l].indexOf(prefix);
                    if (index >= 0) {
                        infoArray.push(JSON.parse(lines[l].substring(index + prefix.length)));
                    }
                }
                for (var i = 0; i < infoArray.length; i++) {
                    infoArray[i].timestamp = Time.createFromTimestamp(infoArray[i].timestamp._timestamp);
                }
            }
            catch (e) {
                cb(e, null);
            }
            cb(null, infoArray);
        }
    });
};
module.exports = MotionLog;

},{"../ifr-core/FileTools":54,"../ifr-core/Time":58}],37:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var BodyOutput = require("./BodyOutput");
/**
 * Timeline output connecting to the body service.
 * @param {Clock} clock - the timeline clock
 * @param {RobotInfo} robotInfo - robot info object
 * @param {string} bodyServiceURL - base URL for the body service
 * @param {string} motionServiceURL - URL for the position server
 * @param {boolean} [startEnabled] - optional, if true, start up with motors enabled (defaults to false)
 * @param {number} [updateIntervalMillis] - if specified and non-zero, auto-update at the given interval
 * @param {string} [sessionToken] - optional session security token
 * @constructor
 */
var MotionServiceOutput = function (clock, robotInfo, bodyServiceURL, motionServiceURL, startEnabled, updateIntervalMillis, sessionToken) {
    BodyOutput.call(this, clock, robotInfo, bodyServiceURL, startEnabled, updateIntervalMillis, sessionToken);
    this.commandSocket = new WebSocket(motionServiceURL);
};
MotionServiceOutput.prototype = Object.create(BodyOutput.prototype);
MotionServiceOutput.prototype.constructor = MotionServiceOutput;
MotionServiceOutput.prototype.update = function () {
    var currentTime = this.clock.currentTime();
    var targets = this.computeTargetsForTime(currentTime.add(this.reactionTime));
    if (targets !== null && this.commandSocket.readyState === WebSocket.OPEN && !this.isPaused()) {
        for (var i = 0; i < this.dofNames.length; i++) {
            targets[i].enabled = this.enabledArray[i];
        }
        var cmd = JSON.stringify(targets);
        this.commandSocket.send(cmd);
        // update listeners
        if (this.infoListeners.length > 0 && this.motionInterface.isConnected()) {
            for (i = 0; i < this.dofNames.length; i++) {
                var state = this.motionInterface.getState(this.dofNames[i]);
                var info = {
                    dofName: this.dofNames[i],
                    timestamp: currentTime,
                    observedPosition: state.pos,
                    targetPosition: targets[i].position,
                    observedVelocity: state.vel,
                    commandVelocity: targets[i].velocity
                };
                for (var c = 0; c < this.infoListeners.length; c++) {
                    this.infoListeners[c](info);
                }
            }
        }
    }
};
/**
 * @return {boolean}
 */
MotionServiceOutput.prototype.isConnected = function () {
    return this.motionInterface.isConnected() && this.commandSocket.readyState === WebSocket.OPEN;
};
module.exports = MotionServiceOutput;

},{"./BodyOutput":26}],38:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var animate = require("../animation-animate/AnimateImpl");
var MotionTimeline = require("../animation-animate/timeline/MotionTimeline");
var SimpleLayerCombiner = require("../animation-animate/timeline/SimpleLayerCombiner");
var ScaleSampleCombiner = require("../animation-animate/timeline/ScaleSampleCombiner");
var AddSampleCombiner = require("../animation-animate/timeline/AddSampleCombiner");
var MixedSampleCombiner = require("../animation-animate/timeline/MixedSampleCombiner");
var RendererOutput = require("../animation-visualize/RendererOutput");
var Clock = require("../ifr-core/Clock");
var TimerTools = require("../ifr-core/TimerTools");
/** @type {MotionTimeline[]} */
var timelineList = [];
/** @type {Array} */
var updateHandleList = [];
/**
 * @param {MotionTimeline} timeline
 * @param {number} updateIntervalMillis
 * @param {Object[]} updateList
 */
var createUpdateLoop = function (timeline, updateIntervalMillis, updateList) {
    var updateHandle = TimerTools.setInterval(function () {
        for (var i = 0; i < updateList.length; i++) {
            updateList[i].update();
        }
    }, updateIntervalMillis);
    timelineList.push(timeline);
    updateHandleList.push(updateHandle);
};
/**
 * @param {MotionTimeline} timeline
 */
var disposeUpdateLoop = function (timeline) {
    var timelineIndex = timelineList.indexOf(timeline);
    if (timelineIndex > -1) {
        TimerTools.clearInterval(updateHandleList[timelineIndex]);
        timelineList.splice(timelineIndex, 1);
        updateHandleList.splice(timelineIndex, 1);
    }
};
var TimelineBuilder = {
    /**
     * @param {RobotInfo} robotInfo - kinematics/config info
     * @param cb - callback to receive the newly-created Timeline instance
     * @param {number} [updateIntervalMillis] - timeline will auto-update with the given delay
     * @param {*} [useTimer] - expected to support setInterval, and have setInterval return an object that supports .stop()
     *
     * @return {MotionTimeline} the newly-created Timeline instance
     */
    createTimeline: function (robotInfo, cb, updateIntervalMillis, useTimer) {
        if (useTimer !== undefined) {
            TimerTools.setInterval = function (callback, intervalTimeMillis) {
                return useTimer.setInterval(callback, intervalTimeMillis, false);
            };
        }
        updateIntervalMillis = (updateIntervalMillis !== undefined) ? updateIntervalMillis : 20;
        // create motion timeline
        var layerCombiner = new SimpleLayerCombiner(robotInfo);
        var motionTimeline = new MotionTimeline("Motion Timeline", robotInfo, Clock, layerCombiner, animate.MODALITY_NAME);
        // configure default layer
        motionTimeline.createLayer("default");
        layerCombiner.addSampleCombiner("default", null);
        // configure lookat layer
        motionTimeline.createLayer("lookat", [robotInfo.getDOFSet("BODY").getDOFs()[0]]);
        layerCombiner.addSampleCombiner("lookat", new AddSampleCombiner());
        // configure additive posture layer
        motionTimeline.createLayer("posture", robotInfo.getDOFSet("BODY").plus("EYE_ROOT").plus("OVERLAY_ROOT").getDOFs());
        layerCombiner.addSampleCombiner("posture", new AddSampleCombiner());
        // configure additive beat layer
        var additiveDOFSet = robotInfo.getDOFSet("BODY").plus("EYE_ROOT").plus("OVERLAY_ROOT");
        var deformerDOFSet = robotInfo.getDOFSet("EYE_DEFORM").plus("OVERLAY_DEFORM").plus("EYE_COLOR");
        motionTimeline.createLayer("beat", additiveDOFSet.plus(deformerDOFSet).getDOFs());
        var beatCombiner = new MixedSampleCombiner(robotInfo);
        beatCombiner.addCombiner(additiveDOFSet.getDOFs(), new AddSampleCombiner());
        var scaleCombiner = new ScaleSampleCombiner(robotInfo, robotInfo.getKinematicInfo().getDefaultPose().getCopy(), null, deformerDOFSet.getDOFs());
        beatCombiner.addCombiner(deformerDOFSet.getDOFs(), scaleCombiner);
        layerCombiner.addSampleCombiner("beat", beatCombiner);
        // configure blink layer
        var blinkDOFs = robotInfo.getDOFSet("EYE_DEFORM").getDOFs();
        motionTimeline.createLayer("blink", blinkDOFs);
        var blinkCombiner = new ScaleSampleCombiner(robotInfo, robotInfo.getKinematicInfo().getDefaultPose().getCopy(), null, blinkDOFs);
        layerCombiner.addSampleCombiner("blink", blinkCombiner);
        // add renderer output
        var rendererOutput = new RendererOutput(Clock);
        rendererOutput.setKinematicInfo(robotInfo.getKinematicInfo());
        motionTimeline.addOutput(rendererOutput);
        // create the update loop
        var updateList = [motionTimeline, rendererOutput];
        createUpdateLoop(motionTimeline, updateIntervalMillis, updateList);
        if (cb) {
            cb(motionTimeline);
        }
        return motionTimeline;
    },
    /**
     * connect a WebGL renderer to the timeline
     * @param {MotionTimeline} timeline
     * @param {RobotRenderer} renderer
     */
    connectRenderer: function (timeline, renderer) {
        var outputs = timeline.getOutputs();
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i] instanceof RendererOutput) {
                outputs[i].addRenderer(renderer);
                break;
            }
        }
    },
    /**
     * disconnect a WebGL renderer from the timeline
     * @param {MotionTimeline} timeline
     * @param {RobotRenderer} renderer
     */
    disconnectRenderer: function (timeline, renderer) {
        var outputs = timeline.getOutputs();
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i] instanceof RendererOutput) {
                outputs[i].removeRenderer(renderer);
                break;
            }
        }
    },
    /**
     * dispose the timeline and stop all timeline-related computation.
     * optionally, dispose of all timeline outputs as well.
     * @param {MotionTimeline} timeline
     * @param {boolean} disposeOutputs - if true, dispose of all installed timeline outputs
     */
    disposeTimeline: function (timeline, disposeOutputs) {
        disposeUpdateLoop(timeline);
        if (disposeOutputs === true) {
            var outputs = timeline.getOutputs();
            for (var i = 0; i < outputs.length; i++) {
                if (outputs[i].dispose !== undefined) {
                    outputs[i].dispose();
                }
            }
        }
    }
};
module.exports = TimelineBuilder;

},{"../animation-animate/AnimateImpl":2,"../animation-animate/timeline/AddSampleCombiner":6,"../animation-animate/timeline/MixedSampleCombiner":15,"../animation-animate/timeline/MotionTimeline":17,"../animation-animate/timeline/ScaleSampleCombiner":20,"../animation-animate/timeline/SimpleLayerCombiner":21,"../animation-visualize/RendererOutput":43,"../ifr-core/Clock":53,"../ifr-core/TimerTools":59}],39:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var THREE = require("@jibo/three");
var RenderPlugin = require("./RenderPlugin");
/**
 *
 * @constructor
 * @extends RenderPlugin
 * @private
 */
var DefaultEyeLighting = function () {
    RenderPlugin.call(this, "DefaultEyeLighting");
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._mainLightBasePosition = new THREE.Vector3(0, 0.03, 0.09);
    /**
     * main light moves by eye-translation * _mainLightXScale in the x axis
     * @type {number}
     * @private
     */
    this._mainLightXScale = 2;
    /**
     * main light moves by eye-translation * _mainLightYScale in the y axis
     * @type {number}
     * @private
     */
    this._mainLightYScale = 2.7;
    /**
     * factor for LED color to affect LED light.  ledLight = (LED color * _ledEffectAmount)
     * @type {number}
     * @private
     */
    this._ledEffectAmount = 0.2;
};
DefaultEyeLighting.prototype = Object.create(RenderPlugin.prototype);
DefaultEyeLighting.prototype.constructor = DefaultEyeLighting;
/**
 * Called initially, once per renderer the plugin is installed into.
 *
 * @param {THREE.Scene} bodyScene - Body scene to install any setup into (may be null if renderer is eye-only).
 * @param {THREE.Scene} eyeScene - Eye scene to install any setup into (may be null if renderer is body-only).
 * @abstract
 */
DefaultEyeLighting.prototype.install = function (bodyScene, eyeScene) {
    if (eyeScene != null) {
        /** @type {THREE.AmbientLight} */
        var ambientLight = new THREE.AmbientLight(0x303030);
        eyeScene.add(ambientLight);
        this._registerObjectForScene(eyeScene, "ambientLight", ambientLight);
        /** @type {THREE.DirectionalLight} */
        var ledLight = new THREE.DirectionalLight(0x000000, 1);
        ledLight.position.set(0, -2, 0);
        eyeScene.add(ledLight);
        this._registerObjectForScene(eyeScene, "ledLight", ledLight);
        /** @type {THREE.PointLight} */
        var pointLight = new THREE.PointLight(0xa0a0a0, 1.2, 1);
        pointLight.position.copy(this._mainLightBasePosition);
        this._registerObjectForScene(eyeScene, "mainLight", pointLight);
        eyeScene.add(pointLight);
        this._markMaterialsForUpdate(eyeScene);
    }
};
/**
 * Called whenever RobotRenderer.display is called, after dofValues have been applied
 * to the modelControlGroups. If this plugin is installed into multiple renderers, will be called separately
 * for each scene.
 *
 * @param {THREE.Scene} bodyScene - Body scene to modify if desired (may be null if renderer is eye-only).
 * @param {THREE.Scene} eyeScene - Eye scene to modify if desired (may be null if renderer is body-only).
 * @param {Object.<string, Object>} dofValues - Update display according to these values.
 * @abstract
 */
DefaultEyeLighting.prototype.update = function (bodyScene, eyeScene, dofValues) {
    if (eyeScene != null) {
        var ledLight = this._getObjectForScene(eyeScene, "ledLight");
        if (ledLight != null) {
            //make ledLight shine the color of the LED ring on the eyeball
            var red = dofValues["lightring_redChannelBn_r"];
            var green = dofValues["lightring_greenChannelBn_r"];
            var blue = dofValues["lightring_blueChannelBn_r"];
            if (red != null && green != null && blue != null) {
                ledLight.color.setRGB(red * this._ledEffectAmount, green * this._ledEffectAmount, blue * this._ledEffectAmount);
            }
        }
        var mainLight = this._getObjectForScene(eyeScene, "mainLight");
        if (mainLight != null) {
            //move the main light towards where the eye is pointing
            var eyeX = dofValues["eyeSubRootBn_t"];
            var eyeY = dofValues["eyeSubRootBn_t_2"];
            if (eyeX != null && eyeY != null) {
                eyeX = this._mainLightBasePosition.x + eyeX * this._mainLightXScale;
                eyeY = this._mainLightBasePosition.y + eyeY * this._mainLightYScale;
                var eyeZ = this._mainLightBasePosition.z;
                mainLight.position.set(eyeX, eyeY, eyeZ);
            }
        }
    }
};
/**
 * Called when this module is removed from a renderer it was previously installed into,
 * once for each renderer the module is removed from.
 *
 * @param {THREE.Scene} bodyScene - Body scene to removed any modifications from (may be null if renderer is eye-only).
 * @param {THREE.Scene} eyeScene - Eye scene to removed any modifications from (may be null if renderer is body-only).
 * @abstract
 */
DefaultEyeLighting.prototype.uninstall = function (bodyScene, eyeScene) {
    if (eyeScene != null) {
        var toDeleteNames = ["ambientLight", "ledLight", "mainLight"];
        for (var i = 0; i < toDeleteNames.length; i++) {
            var light = this._getObjectForScene(eyeScene, toDeleteNames[i]);
            if (light != null) {
                eyeScene.remove(light);
            }
        }
        this._clearObjectForScene(eyeScene);
    }
};
module.exports = DefaultEyeLighting;

},{"./RenderPlugin":42,"@jibo/three":undefined}],40:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var ArticulatedModelLoader = require("../ifr-geometry/loaders/ArticulatedModelLoader");
var KinematicsLoader = require("../ifr-motion/loaders/KinematicsLoader");
var TextureControl = require("../ifr-motion/dofs/TextureControl");
var THREE = require("@jibo/three");
/**
 * @param {JiboConfig} jiboConfig
 * @private
 * @constructor
 */
var JiboBody = function (jiboConfig) {
    /** @type {JiboConfig} */
    this._config = jiboConfig;
    /** @type {CachedImageLoader} */
    this._textureLoader = null;
    /** @type {THREE.Object3D} */
    this._modelRoot = null;
    /** @type {ModelControlGroup} */
    this._modelControlGroup = null;
    /** @type {!boolean} */
    this.loadSucceeded = false;
    /** @type {string} */
    this.loadMessage = "";
};
/**
 * @param {CachedImageLoader} textureLoader
 */
JiboBody.prototype.setTextureLoader = function (textureLoader) {
    this._textureLoader = textureLoader;
};
JiboBody.prototype.load = function (callback) {
    var self = this;
    var loader = new ArticulatedModelLoader();
    loader.modelLoader.defaultMaterial.side = THREE.DoubleSide;
    loader.load("body model", self._config.getBodyGeometryURL(), self._config.getBodySkeletonURL(), function () {
        var result = loader.getResult();
        if (result.success) {
            self._modelRoot = result.modelRoot;
            var kinematicsLoader = new KinematicsLoader();
            /** @type {TextureControl.Factory} */
            var textureFactory = kinematicsLoader.getModelControlFactory(TextureControl.Factory.prototype._controlType);
            if (self._textureLoader) {
                textureFactory.setSharedImageLoader(self._textureLoader);
            }
            kinematicsLoader.load(self._config.getBodyKinematicsURL(), function () {
                var kinematicsResult = kinematicsLoader.getResult();
                if (kinematicsResult.success) {
                    self._modelControlGroup = kinematicsResult.modelControlGroup;
                    self._modelControlGroup.attachToModel(self._modelRoot);
                    self.loadSucceeded = true;
                }
                else {
                    self.loadSucceeded = false;
                    self.loadMessage = "kinematics load failed with message: " + kinematicsResult.message + ", URL = " + kinematicsResult.url;
                }
                if (callback) {
                    callback();
                }
            });
        }
        else {
            self.loadSucceeded = false;
            self.loadMessage = "" + result.message + ", model URL = " + result.modelUrl + ", skeleton URL = " + result.skeletonUrl;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @return {THREE.Object3D}
 */
JiboBody.prototype.getModelRoot = function () {
    return this._modelRoot;
};
/**
 * @return {ModelControlGroup}
 */
JiboBody.prototype.getModelControlGroup = function () {
    return this._modelControlGroup;
};
/**
 * @param {SceneInfo} sceneInfo
 * @return {THREE.WebGLRenderTarget}
 */
JiboBody.prototype.constructFaceScreenRenderTarget = function (sceneInfo) {
    var renderTexture = new THREE.WebGLRenderTarget(800, 450);
    renderTexture.minFilter = THREE.LinearFilter;
    var faceScreenMesh = this.getModelRoot().getObjectByName(sceneInfo.faceScreenMeshName, true);
    faceScreenMesh.material.map = renderTexture;
    return renderTexture;
};
module.exports = JiboBody;

},{"../ifr-geometry/loaders/ArticulatedModelLoader":63,"../ifr-motion/dofs/TextureControl":89,"../ifr-motion/loaders/KinematicsLoader":97,"@jibo/three":undefined}],41:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var ArticulatedModelLoader = require("../ifr-geometry/loaders/ArticulatedModelLoader");
var KinematicsLoader = require("../ifr-motion/loaders/KinematicsLoader");
var TextureControl = require("../ifr-motion/dofs/TextureControl");
var THREE = require("@jibo/three");
/**
 * @param {JiboConfig} jiboConfig
 * @private
 * @constructor
 */
var JiboEye = function (jiboConfig) {
    /** @type {JiboConfig} */
    this._config = jiboConfig;
    /** @type {CachedImageLoader} */
    this._textureLoader = null;
    /** @type {THREE.Object3D} */
    this._modelRoot = null;
    /** @type {ModelControlGroup} */
    this._modelControlGroup = null;
    /** @type {!boolean} */
    this.loadSucceeded = false;
    /** @type {string} */
    this.loadMessage = "";
};
/**
 * @param {CachedImageLoader} textureLoader
 */
JiboEye.prototype.setTextureLoader = function (textureLoader) {
    this._textureLoader = textureLoader;
};
JiboEye.prototype.load = function (callback) {
    var self = this;
    var loader = new ArticulatedModelLoader();
    loader.load("eye model", self._config.getEyeGeometryURL(), self._config.getEyeSkeletonURL(), function () {
        var result = loader.getResult();
        if (result.success) {
            self._modelRoot = result.modelRoot;
            // prepare eye overlays
            var overlayZ = 0;
            var deltaZ = 0.01;
            for (var childIndex = 0; childIndex < self._modelRoot.children.length; childIndex++) {
                var child = self._modelRoot.children[childIndex];
                if (child instanceof THREE.SkinnedMesh) {
                    child.material.transparent = true;
                    child.frustumCulled = false;
                    child.position.z = overlayZ;
                    overlayZ += deltaZ;
                }
            }
            self._modelRoot.traverse(function (obj) {
                if (obj instanceof THREE.Mesh) {
                    obj.material.transparent = true;
                    obj.frustumCulled = false;
                }
            });
            var kinematicsLoader = new KinematicsLoader();
            /** @type {TextureControl.Factory} */
            var textureFactory = kinematicsLoader.getModelControlFactory(TextureControl.Factory.prototype._controlType);
            if (self._textureLoader) {
                textureFactory.setSharedImageLoader(self._textureLoader);
            }
            kinematicsLoader.load(self._config.getEyeKinematicsURL(), function () {
                var kinematicsResult = kinematicsLoader.getResult();
                if (kinematicsResult.success) {
                    self._modelControlGroup = kinematicsResult.modelControlGroup;
                    self._modelControlGroup.attachToModel(self._modelRoot);
                    //config for default normal map for users not specifying a normal url
                    for (var ci = 0; ci < self._modelControlGroup.getControlList().length; ci++) {
                        if (self._modelControlGroup.getControlList()[ci].getControlType() === "TEXTURE") {
                            self._modelControlGroup.getControlList()[ci].setDefaultNormalURL(self._config.getDefaultNormalMap());
                        }
                    }
                    self.loadSucceeded = true;
                }
                else {
                    self.loadSucceeded = false;
                    self.loadMessage = "kinematics load failed with message: " + kinematicsResult.message + ", URL = " + kinematicsResult.url;
                }
                if (callback) {
                    callback();
                }
            });
        }
        else {
            self.loadSucceeded = false;
            self.loadMessage = "" + result.message + ", model URL = " + result.modelUrl + ", skeleton URL = " + result.skeletonUrl;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @return {THREE.Object3D}
 */
JiboEye.prototype.getModelRoot = function () {
    return this._modelRoot;
};
/**
 * @return {ModelControlGroup}
 */
JiboEye.prototype.getModelControlGroup = function () {
    return this._modelControlGroup;
};
/**
 * @param {SceneInfo} sceneInfo
 * @return {THREE.Camera}
 */
JiboEye.prototype.constructCamera = function (sceneInfo) {
    var camera = new THREE.OrthographicCamera(-sceneInfo.faceScreenWidth / 2, sceneInfo.faceScreenWidth / 2, sceneInfo.faceScreenHeight / 2, -sceneInfo.faceScreenHeight / 2, -20, 20);
    camera.position.set(0, 0, 5); //need to provide a position for lighting to work
    //could do as perspective, if having trouble with lighting:
    //var distance = 5;
    //var fov = 0.79;
    //var camera = new THREE.PerspectiveCamera(fov, sceneInfo.faceScreenWidth/sceneInfo.faceScreenHeight, distance-0.5, distance+0.5);
    //camera.position.set(0,0,distance);
    //camera.lookAt(new THREE.Vector3(0,0,0));
    //console.log("Camera matrixWorld = "+camera.matrixWorld.elements);
    camera.updateMatrixWorld(true);
    return camera;
};
/**
 * @return {THREE.Scene}
 */
JiboEye.prototype.constructScene = function () {
    var scene = new THREE.Scene();
    scene.add(this.getModelRoot());
    return scene;
};
module.exports = JiboEye;

},{"../ifr-geometry/loaders/ArticulatedModelLoader":63,"../ifr-motion/dofs/TextureControl":89,"../ifr-motion/loaders/KinematicsLoader":97,"@jibo/three":undefined}],42:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var THREE = require("@jibo/three");
var slog = require("../ifr-core/SLog");
var channel = "RENDER_PLUGIN";
/**
 * Base class for plugins that extend the 3D scene displaying Jibo's eye and/or body.
 * Useful for including additional 3D geometry, dynamic lighting, etc.
 *
 * @param {string} name - The unique name for this plugin.
 * @class RenderPlugin
 * @memberof jibo.visualize
 */
var RenderPlugin = function (name) {
    /**
     * @type {string}
     * @private
     */
    this._name = name;
    /**
     * @type {SceneObjectCache[]}
     * @private
     */
    this._installed_cache = null;
};
/**
 * @param {THREE.Scene} scene
 * @constructor
 * @private
 */
var SceneObjectCache = function (scene) {
    /** @type {THREE.Scene} */
    this._scene = scene;
    /** @type {Object.<string,object>} */
    this._objects = {};
};
/**
 * Helper to keep track of per-scene objects used by this plugin.
 * Use this function to access per-scene objects registered by _registerObjectForScene
 * @param {THREE.Scene} scene - Scene for which to retrieve the object.
 * @param {string} name - Name of the object to retrieve.
 * @return {object}
 * @private
 * @protected
 */
RenderPlugin.prototype._getObjectForScene = function (scene, name) {
    if (this._installed_cache == null) {
        return null;
    }
    var matchingCache = null;
    for (var i = 0; i < this._installed_cache.length; i++) {
        if (scene === this._installed_cache[i]._scene) {
            matchingCache = this._installed_cache[i];
            break;
        }
    }
    if (matchingCache === null) {
        return null;
    }
    if (matchingCache._objects.hasOwnProperty(name)) {
        return matchingCache._objects[name];
    }
    else {
        return null;
    }
};
/**
 * Helper to keep track of per-scene objects used by this plugin.
 * Use this function to clear all saved object data for a scene
 * (usually at the end of plugin uninstall).
 *
 * @param {THREE.Scene} scene - Scene for which to delete object data.
 * @param {string} [name] - Name of the object to delete.  If omitted, delete all saved data for the scene.
 * @protected
 */
RenderPlugin.prototype._clearObjectForScene = function (scene, name) {
    if (this._installed_cache == null) {
        return;
    }
    for (var i = 0; i < this._installed_cache.length; i++) {
        if (scene === this._installed_cache[i]._scene) {
            if (name == null) {
                this._installed_cache.splice(i, 1);
            }
            else {
                var matchingCache = this._installed_cache[i];
                delete matchingCache._objects[name];
            }
            break;
        }
    }
};
/**
 * Helper to keep track of per-scene objects used by this plugin.
 * Use this function to register a per-scene object to be later updated
 * or uninstalled.
 *
 * @param {THREE.Scene} scene - Scene for which to register the object.
 * @param {string} name - Name of the object, for retrieval (should be unique among objects in this scene).
 * @param {object} object - Object to register.
 * @protected
 */
RenderPlugin.prototype._registerObjectForScene = function (scene, name, object) {
    if (this._installed_cache == null) {
        this._installed_cache = [];
    }
    var matchingCache = null;
    for (var i = 0; i < this._installed_cache.length; i++) {
        if (scene === this._installed_cache[i]._scene) {
            matchingCache = this._installed_cache[i];
            break;
        }
    }
    if (matchingCache === null) {
        matchingCache = new SceneObjectCache(scene);
        this._installed_cache.push(matchingCache);
    }
    if (matchingCache._objects.hasOwnProperty(name)) {
        slog(channel, "Error, RenderPlugin registering object \"" + name + "\" but one is already registered");
    }
    matchingCache._objects[name] = object;
};
/**
 * After adding a light to the scene, materials need to be re-initialized.
 * Call this to set "needsUpdate" on all materials in a scene.
 *
 * @param {THREE.Scene} scene - Scene to mark for update.
 * @protected
 */
RenderPlugin.prototype._markMaterialsForUpdate = function (scene) {
    scene.traverse(function (sceneElement) {
        if (sceneElement instanceof THREE.Mesh && sceneElement.material != null) {
            sceneElement.material.needsUpdate = true;
        }
    });
};
/* interface definition:        */
/* eslint-disable no-unused-vars */
/**
 * Called initially, once per renderer the plugin is installed into.
 * @method jibo.visualize.RenderPlugin#install
 * @param {THREE.Scene} bodyScene - Body scene to install any setup into; may be null if renderer is eye-only.
 * @param {THREE.Scene} eyeScene - Eye scene to install any setup into; may be null if renderer is body-only.
 */
RenderPlugin.prototype.install = function (bodyScene, eyeScene) { };
/**
 * Called whenever RobotRenderer.display is called, after dofValues have been applied
 * to the modelControlGroups. If this plugin is installed into multiple renderers, will be called seperately
 * for each scene.
 * @method jibo.visualize.RenderPlugin#update
 * @param {THREE.Scene} bodyScene - Body scene to modify if desired; may be null if renderer is eye-only.
 * @param {THREE.Scene} eyeScene - Eye scene to modify if desired; may be null if renderer is body-only.
 * @param {Object.<string, Object>} dofValues - Update display according to these values.
 */
RenderPlugin.prototype.update = function (bodyScene, eyeScene, dofValues) { };
/**
 * Called when this module is removed from a renderer it was previously install'ed into,
 * once for each renderer the module is removed from.
 * @method jibo.visualize.RenderPlugin#uninstall
 * @param {THREE.Scene} bodyScene - Body scene to removed any modifications from; may be null if renderer is eye-only.
 * @param {THREE.Scene} eyeScene - Eye scene to removed any modifications from; may be null if renderer is body-only
 */
RenderPlugin.prototype.uninstall = function (bodyScene, eyeScene) { };
/**
 * Returns the name of the plugin.
 * @method jibo.visualize.RenderPlugin#getName
 * @returns {string}
 */
RenderPlugin.prototype.getName = function () {
    return this._name;
};
module.exports = RenderPlugin;

},{"../ifr-core/SLog":57,"@jibo/three":undefined}],43:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * @param {Clock} clock
 * @private
 * @constructor
 */
var RendererOutput = function (clock) {
    /** @type {Clock} */
    this.clock = clock;
    /** @type {JiboKinematicInfo} */
    this.kinematicInfo = null;
    /** @type {RobotRenderer[]} */
    this.renderers = [];
    /** @type {Time} */
    this.outputTime = null;
    /** @type {Pose} */
    this.outputPose = null;
};
/**
 * @param {JiboKinematicInfo} kinematicInfo
 */
RendererOutput.prototype.setKinematicInfo = function (kinematicInfo) {
    this.kinematicInfo = kinematicInfo;
};
/**
 * @param {RobotRenderer} renderer
 */
RendererOutput.prototype.addRenderer = function (renderer) {
    this.renderers.push(renderer);
};
/**
 * @param {RobotRenderer} renderer
 */
RendererOutput.prototype.removeRenderer = function (renderer) {
    var rendererIndex = this.renderers.indexOf(renderer);
    if (rendererIndex > -1) {
        this.renderers.splice(rendererIndex, 1);
    }
};
/**
 * @return {RobotRenderer[]}
 */
RendererOutput.prototype.getRenderers = function () {
    return this.renderers.slice(0);
};
/**
 * @param {Time} time
 * @param {Pose} pose
 * @param {Object} blackboard
 */
RendererOutput.prototype.handleOutput = function (time, pose, blackboard) {
    this.outputTime = time;
    this.outputPose = pose;
};
RendererOutput.prototype.update = function () {
    if (this.kinematicInfo !== null && this.outputPose !== null) {
        var pose = this.outputPose;
        var dofValues = {};
        var dofNames = pose.getDOFNames();
        for (var dofIndex = 0; dofIndex < dofNames.length; dofIndex++) {
            var dofValue = pose.get(dofNames[dofIndex], 0);
            dofValues[dofNames[dofIndex]] = dofValue;
        }
        for (var r = 0; r < this.renderers.length; r++) {
            this.renderers[r].display(dofValues);
        }
    }
};
RendererOutput.prototype.dispose = function () {
    for (var i = 0; i < this.renderers.length; i++) {
        this.renderers[i].dispose();
    }
    this.renderers = [];
    this.kinematicInfo = null;
    this.outputPose = null;
};
module.exports = RendererOutput;

},{}],44:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var SceneInfo = require("../geometry-info/SceneInfo");
var JiboBody = require("./JiboBody");
var JiboEye = require("./JiboEye");
var BasicScene = require("../ifr-visualizer/BasicScene");
var CachedImageLoader = require("../ifr-geometry/loaders/CachedImageLoader");
var THREE = require("@jibo/three");
var DefaultEyeLighting = require("./DefaultEyeLighting");
var slog = require("../ifr-core/SLog");
var channel = "MODEL_LOADING";
/**
 * Protected constructor for internal use only.
 *
 * WebGL renderer displaying Jibo's eye and/or body.  Created via the visualize module's
 * [createRobotRenderer]{@link jibo.visualize#createRobotRenderer} method.
 *
 * @param {jibo.animate.RobotInfo} robotInfo - Protected constructor parameter.
 * @param {BasicScene} rootScene - The BasicScene; may contain body scene if present, otherwise eye scene if eye-only.
 * @param {THREE.Scene} bodyScene - Body THREE scene; may be null if eye-only.
 * @param {THREE.Scene} eyeScene - Eye THREE scene; may be a sub-scene rendering to texture in body+eye.
 * @param {ModelControlGroup[]} modelControlGroups - Protected constructor parameter.
 * @param {CachedImageLoader} textureLoader - Protected constructor parameter.
 * @class RobotRenderer
 * @intdocs
 * @memberof jibo.visualize
 * @protected
 */
var RobotRenderer = function (robotInfo, rootScene, bodyScene, eyeScene, modelControlGroups, textureLoader) {
    /** @type {RobotInfo} */
    /** @private */
    this.robotInfo = robotInfo;
    /** @type {BasicScene} */
    /** "main" scene: bodyScene if we are body, eye scene if we are eye-only */
    /** @private */
    this.scene = rootScene;
    /** @type {ModelControlGroup[]} */
    /** @private */
    this.modelControlGroups = modelControlGroups;
    /** @type {CachedImageLoader} */
    /** @private */
    this.textureLoader = textureLoader;
    /** @type {THREE.GridHelper} */
    /** @private */
    this.grid = null;
    /** @type {string[]} */
    /** @private */
    this.renderedDOFs = [];
    /** Used for tracking if dof has moved in trackDOFDirty mode
     *   Indexed by rendererDOFs
     * @type {number[]} */
    /** @private */
    this.dofLastValues = [];
    /** Used for determining which dofs are numeric (for using epsilon distance) in trackDOFDirty mode.
     *   Indexed by rendererDOFs
     * @type {boolean[]} */
    /** @private */
    this.dofIsMetric = [];
    for (var i = 0; i < this.modelControlGroups.length; i++) {
        var groupIDOFNames = this.modelControlGroups[i].getDOFNames();
        for (var di = 0; di < groupIDOFNames.length; di++) {
            var dofName = groupIDOFNames[di];
            if (this.renderedDOFs.indexOf(dofName) < 0) {
                this.renderedDOFs.push(dofName);
                this.dofLastValues.push(Infinity); //starting value that will necessitate a first update no matter what
                this.dofIsMetric.push(robotInfo.getDOFInfo(dofName).isMetric());
            }
        }
    }
    /** Used for measuring distance in trackDOFDirty mode
     * @type {number} */
    /** @private */
    this.dofChangeEpsilon = 0.0001;
    /** @type {boolean} */
    /** @private */
    this.trackDOFDirtyStatus = false;
    /** @type {Object.<string,RenderPlugin>} */
    /** @private */
    this.renderPlugins = {};
    /** @type {THREE.Scene} */
    /** @private */
    this.bodyScene = bodyScene;
    /** @type {THREE.Scene} */
    /** @private */
    this.eyeScene = eyeScene;
    this.display(this.robotInfo.getDefaultDOFValues());
    if (this.scene.getContainer() !== null) {
        this.scene.play();
    }
};
/**
 * Set this to true to only render graphics when a dof value has changed.
 * @method jibo.visualize.RobotRenderer#setRenderOnlyWhenDirty
 * @param {boolean} renderOnlyWhenDirty `true` to only render graphics when a dof value has changed.
 */
RobotRenderer.prototype.setRenderOnlyWhenDirty = function (renderOnlyWhenDirty) {
    this.trackDOFDirtyStatus = renderOnlyWhenDirty;
    this.scene.setRenderOnlyWhenDirty(renderOnlyWhenDirty);
};
/**
 * Specify the number of frames after which graphics should render.
 * @method jibo.visualize.RobotRenderer#setRenderEveryNFrames
 * @param {number} renderEveryNFrames - Render at most once every renderEveryNFrames frames (1 means render every time)
 */
RobotRenderer.prototype.setRenderEveryNFrames = function (renderEveryNFrames) {
    this.scene.setRenderEveryNFrames(renderEveryNFrames);
};
/**
 * Updates the display according to the specified values.
 * @method jibo.visualize.RobotRenderer#display
 * @param {Object.<string, Object>} dofValues - Update display according to these values.
 */
RobotRenderer.prototype.display = function (dofValues) {
    var shouldUpdate = true;
    //if we are tracking dirty status, find out if any dof values
    // (that we use) have changed, pass that info through to the BasicScene,
    // and skip updating if nothing has changed.
    if (this.trackDOFDirtyStatus) {
        var aDOFMoved = false;
        var e = this.dofChangeEpsilon;
        for (var j = 0; j < this.renderedDOFs.length; j++) {
            var newValue = dofValues[this.renderedDOFs[j]];
            var oldValue = this.dofLastValues[j];
            if (newValue !== oldValue) {
                if (this.dofIsMetric[j]) {
                    if (Math.abs(oldValue - newValue) > e) {
                        aDOFMoved = true;
                        this.dofLastValues[j] = newValue;
                    }
                }
                else {
                    aDOFMoved = true;
                    this.dofLastValues[j] = newValue;
                }
            }
        }
        if (aDOFMoved) {
            //shouldUpdate = true; //implied
            this.scene.markDirty();
        }
        else {
            shouldUpdate = false;
        }
    }
    //this.displayRawCounter = this.displayRawCounter+1;
    //if(shouldUpdate){
    //	this.displayActualCounter = this.displayActualCounter+1;
    //}
    //if(this.displayRawCounter > 200 || isNaN(this.displayRawCounter)){
    //	console.log("Drew "+(this.displayActualCounter/this.displayRawCounter).toFixed(2));
    //	this.displayActualCounter = 0;
    //	this.displayRawCounter = 0;
    //}
    //
    if (shouldUpdate) {
        var i;
        for (i = 0; i < this.modelControlGroups.length; i++) {
            this.modelControlGroups[i].updateFromDOFValues(dofValues);
        }
        var renderPluginNames = Object.keys(this.renderPlugins);
        for (i = 0; i < renderPluginNames.length; i++) {
            //Note: this will only be new dof values.  is there a case where
            // people pass in partial dof value maps, and we want to pass in ALL dof values here?
            // (keep a cached map?)
            this.renderPlugins[renderPluginNames[i]].update(this.bodyScene, this.eyeScene, dofValues);
        }
    }
};
/**
 * Load a texture.
 * @method jibo.visualize.RobotRenderer#loadTexture
 * @param {string} uri - A uri of a texture to pre-load to prepare for displaying.
 */
RobotRenderer.prototype.loadTexture = function (uri) {
    this.textureLoader.loadImage(uri);
};
/**
 * Sets background color of the gl view.
 * @method jibo.visualize.RobotRenderer#setBackgroundColor
 * @param {number} r - Red (0-1).
 * @param {number} g - Green (0-1).
 * @param {number} b - Blue (0-1).
 * @param {number} [a] - Alpha (0-1); defaults to 1.
 */
RobotRenderer.prototype.setBackgroundColor = function (r, g, b, a) {
    if (!a) {
        a = 1;
    }
    this.scene.getRenderer().setClearColor(new THREE.Color(r, g, b), a);
};
/**
 * Sets the camera parameters for the GL view.
 * @method jibo.visualize.RobotRenderer#setCamera
 * @param {THREE.Vector3} position - Position of the camera
 * @param {THREE.Vector3} [lookat] - Position of the camera's look-at target; defaults to origin.
 * @param {number} [fov] - Camera field of view in degrees; defaults to 45 degrees.
 */
RobotRenderer.prototype.setCamera = function (position, lookat, fov) {
    var pos = position;
    var look = lookat ? lookat : new THREE.Vector3();
    var f = fov ? fov : 45;
    this.scene.getCamera().position.copy(pos);
    this.scene.getTrackballControls().target.copy(look);
    this.scene.getCamera().fov = f;
    this.scene.getCamera().updateProjectionMatrix();
};
/**
 * Sets parameters for a ground-plane grid.
 * @method jibo.visualize.RobotRenderer#setGrid
 * @param {number} stepSize - Spacing between gridlines.
 * @param {number} stepsFromCenter - Number of grid steps from the origin.
 * @param {THREE.Color} lineColor - Gridline color.
 */
RobotRenderer.prototype.setGrid = function (stepSize, stepsFromCenter, lineColor) {
    if (this.grid !== null) {
        this.scene.getScene().remove(this.grid);
    }
    this.grid = new THREE.GridHelper(stepsFromCenter * stepSize, stepSize);
    this.grid.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    this.grid.setColors(lineColor, lineColor);
    this.scene.getScene().add(this.grid);
};
/**
 * Removes the renderer from the DOM and stop all associated computation and event handling.
 * Rendering can be resumed via the attachToContainer method.
 * @method jibo.visualize.RobotRenderer#detachFromContainer
 */
RobotRenderer.prototype.detachFromContainer = function () {
    this.scene.detachFromContainer();
};
/**
 * Attaches the renderer to the given DOM element and begins/resumes rendering and event handling.
 * @method jibo.visualize.RobotRenderer#attachToContainer
 * @param {Element} domElement - Container element where renderer will be installed; can be null.
 */
RobotRenderer.prototype.attachToContainer = function (domElement) {
    if (this.scene.getContainer() !== null) {
        this.detachFromContainer();
    }
    this.scene.attachToContainer(domElement);
    if (this.scene.getContainer() !== null) {
        this.scene.play();
    }
};
/**
 * Permanently removes the renderer from the DOM and release its resources.
 * @method jibo.visualize.RobotRenderer#dispose
 */
RobotRenderer.prototype.dispose = function () {
    if (this.scene !== null) {
        this.scene.dispose();
        this.scene = null;
    }
    this.robotInfo = null;
    this.modelControlGroups = [];
    this.textureLoader = null;
    this.grid = null;
};
/**
 * Removes the mouse-based camera controls, if installed.
 * @method jibo.visualize.RobotRenderer#removeCameraControls
 */
RobotRenderer.prototype.removeCameraControls = function () {
    this.scene.removeTrackballControls();
};
/**
 * Installs this render plugin. If a plugin with the same name is already installed, that
 * plugin will be uninstalled first.
 * @method jibo.visualize.RobotRenderer#installRenderPlugin
 * @param {jibo.visualize.RenderPlugin} renderPlugin - Plugin to install.
 */
RobotRenderer.prototype.installRenderPlugin = function (renderPlugin) {
    var name = renderPlugin.getName();
    if (this.renderPlugins.hasOwnProperty(name)) {
        this.renderPlugins[name].uninstall(this.bodyScene, this.eyeScene);
    }
    renderPlugin.install(this.bodyScene, this.eyeScene);
    this.renderPlugins[name] = renderPlugin;
};
/**
 * Removes named RenderPlugin. [uninstall()]{@link jibo.visualize.RenderPlugin#uninstall} will be called on the plugin.
 * @method jibo.visualize.RobotRenderer#removeRenderPlugin
 * @param {string} renderPluginName Plugin to remove.
 */
RobotRenderer.prototype.removeRenderPlugin = function (renderPluginName) {
    if (this.renderPlugins.hasOwnProperty(renderPluginName)) {
        this.renderPlugins[renderPluginName].uninstall(this.bodyScene, this.eyeScene);
        delete this.renderPlugins[renderPluginName];
    }
};
/**
 * Gets the names of all installed RenderPlugins.
 * @method jibo.visualize.RobotRenderer#getInstalledRenderPluginNames
 * @returns {string[]} An array of the names of all installed RenderPlugins.
 */
RobotRenderer.prototype.getInstalledRenderPluginNames = function () {
    return Object.keys(this.renderPlugins);
};
/**
 * @description
 * Graphical Display/Visualization API, including API for creating/controlling
 * THREE renderers of Jibo's eye or entire body.
 *
 * ```
 * var jibo = require("jibo");
 * jibo.visualize.createRobotRenderer(eyeContainerElement, jibo.visualize.DisplayType.EYE);
 * ```
 * @namespace jibo.visualize
 */
var visualize = {
    /**
     * @callback jibo.visualize~RobotRendererCreatedCallback
     * @param {jibo.visualize.RobotRenderer} robotRenderer - The RobotRenderer or null on failure.
     */
    /**
     * Creates a renderer bound to the given DOM element. Use to make the various renderers
     * in SDK mode. In robot mode, there will be a single renderer for the eye screen, which
     * can be accessed via "getEye" below.
     *
     * @method jibo.visualize#createRobotRenderer
     * @param {jibo.animate.RobotInfo} robotInfo Robot configuration info used by the animate module.
     * @param {Element} domElement - Container element where THREE renderer will be installed (can be null).
     * @param {jibo.visualize~DisplayType} displayType - Type of display; "BODY" or "EYE".
     * @param {jibo.visualize~RobotRendererCreatedCallback} cb - Callback; receives newly-created RobotRenderer instance, or null if creation failed.
     * @static
     */
    createRobotRenderer: function (robotInfo, domElement, displayType, cb) {
        var config = robotInfo.getConfig();
        /** @type {BasicScene} */
        var scene = null;
        /** @type {ModelControlGroup[]} */
        var modelControlGroups = [];
        var textureLoader = new CachedImageLoader();
        var robotRenderer = null;
        var sceneInfo = new SceneInfo();
        sceneInfo.load(config.getSceneInfoURL(), function () {
            if (sceneInfo.loadSucceeded) {
                var jiboEye = new JiboEye(config);
                jiboEye.setTextureLoader(textureLoader);
                jiboEye.load(function () {
                    if (jiboEye.loadSucceeded) {
                        modelControlGroups.push(jiboEye.getModelControlGroup());
                        if (displayType === visualize.DisplayType.EYE) {
                            scene = new BasicScene(domElement, false, false, new THREE.Color(0, 0, 0));
                            scene._camera = jiboEye.constructCamera(sceneInfo);
                            scene._scene = jiboEye.constructScene();
                            robotRenderer = new RobotRenderer(robotInfo, scene, null, scene._scene, modelControlGroups, textureLoader);
                            robotRenderer.installRenderPlugin(new DefaultEyeLighting());
                            if (cb) {
                                cb(robotRenderer);
                            }
                        }
                        else {
                            var jiboBody = new JiboBody(config);
                            jiboBody.setTextureLoader(textureLoader);
                            jiboBody.load(function () {
                                if (jiboBody.loadSucceeded) {
                                    modelControlGroups.push(jiboBody.getModelControlGroup());
                                    scene = new BasicScene(domElement, false, false, new THREE.Color(0, 0, 0.3));
                                    scene.getCamera().up = new THREE.Vector3(0, 0, 1);
                                    scene.installTrackballControls(); //do this after we set the camera up
                                    // lighting
                                    scene.getDirectionalLight().intensity = 0.5;
                                    scene.getDirectionalLight().position.set(1, -1, 1);
                                    var light2 = new THREE.DirectionalLight(0xffffff, 0.5);
                                    light2.position.set(1, 1, 1);
                                    scene.getScene().add(light2);
                                    var light3 = new THREE.DirectionalLight(0xffffff, 0.5);
                                    light3.position.set(-1, 0, 1);
                                    scene.getScene().add(light3);
                                    var modelRoot = jiboBody.getModelRoot();
                                    //modelRoot.position.z = 1.905/100; //in model now
                                    scene.getScene().add(modelRoot);
                                    var eyeScene = jiboEye.constructScene();
                                    var eyeCamera = jiboEye.constructCamera(sceneInfo);
                                    var eyeRenderTarget = jiboBody.constructFaceScreenRenderTarget(sceneInfo);
                                    var sceneClearColor = new THREE.Color();
                                    var screenClearColor = new THREE.Color(0, 0, 0);
                                    scene.addRenderCallback(function () {
                                        var renderer = scene.getRenderer();
                                        sceneClearColor.copy(renderer.getClearColor());
                                        renderer.setClearColor(screenClearColor);
                                        renderer.render(eyeScene, eyeCamera, eyeRenderTarget);
                                        renderer.setClearColor(sceneClearColor);
                                    });
                                    robotRenderer = new RobotRenderer(robotInfo, scene, scene._scene, eyeScene, modelControlGroups, textureLoader);
                                    robotRenderer.setCamera(new THREE.Vector3(0.50, 0.0, 0.37), new THREE.Vector3(0, 0, 0.17), 45);
                                    robotRenderer.installRenderPlugin(new DefaultEyeLighting());
                                    if (cb) {
                                        cb(robotRenderer);
                                    }
                                }
                                else {
                                    slog(channel, "JiboBody load error: " + jiboBody.loadMessage);
                                    if (cb) {
                                        cb(null);
                                    }
                                }
                            });
                        }
                    }
                    else {
                        slog(channel, "JiboEye load error: " + jiboEye.loadMessage);
                        if (cb) {
                            cb(null);
                        }
                    }
                });
            }
            else {
                slog(channel, "SceneInfo load error: " + sceneInfo.loadMessage);
                if (cb) {
                    cb(null);
                }
            }
        });
    },
    /**
     * This will provide access to the pre-initialized RobotRenderer instance running full
     * screen on the robot's eye during on-robot operation.
     *
     * @method jibo.visualize#getEye
     * @return {RobotRenderer}
     * @private
     * @static
     */
    getEye: function () {
        return null;
    }
};
/**
 * Enum Values for createRobotRenderer.
 * @enum {string}
 * @alias jibo.visualize~DisplayType
 */
var DisplayType = {
    /** Body display type */
    BODY: "BODY",
    /** Eye display type */
    EYE: "EYE"
};
/**
 * @type {DisplayType}
 */
visualize.DisplayType = DisplayType;
module.exports = visualize;

},{"../geometry-info/SceneInfo":51,"../ifr-core/SLog":57,"../ifr-geometry/loaders/CachedImageLoader":64,"../ifr-visualizer/BasicScene":128,"./DefaultEyeLighting":39,"./JiboBody":40,"./JiboEye":41,"@jibo/three":undefined}],45:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var FileTools = require("../ifr-core/FileTools");
var slog = require("../ifr-core/SLog");
var channel = "MODEL_LOADING";
/**
 * Protected constructor for internal use only.
 *
 * Creates a DOFSet, including the provided DOFs.
 * The dofSetGroup provided looks up other DOFSets by name when
 * sets are identified by name (e.g., in the "plus" function).
 *
 * @param {string[]} includeDOFs - DOFs in this set. If null, 0 DOFs will be in set.
 * @param {Object.<string, jibo.animate.DOFSet>} dofSetGroup - Map to look up other DOFSets by name when requested (e.g., "plus" function).
 * @class DOFSet
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var DOFSet = function (includeDOFs, dofSetGroup) {
    /** @type {Object.<string, boolean>} */
    /** @private */
    var _dofsSet = {};
    if (includeDOFs != null) {
        for (var i = 0; i < includeDOFs.length; i++) {
            _dofsSet[includeDOFs[i]] = true;
        }
    }
    /**
     * Creates a new DOFSet containing the all of the DOFs of this
     * DOFSet plus all the dofs of the set passed in.  Duplicates
     * are included only once (union of the sets)
     * @method jibo.animate.DOFSet#plus
     * @param {jibo.animate.DOFSet|string} otherSet - Set to add, either the name of the set or the actual DOFSet.
     * @returns {jibo.animate.DOFSet} Union of this and otherSet.
     */
    this.plus = function (otherSet) {
        /** @type {DOFSet} */
        var setToAdd;
        if (typeof (otherSet) === "string") {
            setToAdd = dofSetGroup[otherSet];
        }
        else {
            setToAdd = otherSet;
        }
        var newList = this.getDOFs();
        var incomingList = setToAdd.getDOFs();
        if (setToAdd != null) {
            for (var i = 0; i < incomingList.length; i++) {
                //add all from otherSet that aren't already in
                if (!_dofsSet.hasOwnProperty(incomingList[i])) {
                    newList.push(incomingList[i]);
                }
            }
        }
        return new DOFSet(newList, dofSetGroup);
    };
    /**
     * Creates a new DOFSet containing all the DOFs of this
     * DOFSet that are not present in otherSet.
     * @method jibo.animate.DOFSet#minus
     * @param {jibo.animate.DOFSet|string} otherSet - Set to subtract, either the name of the set or the actual DOFSet.
     * @returns {jibo.animate.DOFSet} DOFSet containing DOFs of this set that are not in the argument set.
     */
    this.minus = function (otherSet) {
        /** @type {DOFSet} */
        var setToSubtract;
        if (typeof (otherSet) === "string") {
            setToSubtract = dofSetGroup[otherSet];
        }
        else {
            setToSubtract = otherSet;
        }
        var newList = [];
        var myDOFs = this.getDOFs();
        if (setToSubtract != null) {
            for (var i = 0; i < myDOFs.length; i++) {
                if (!setToSubtract.hasDOF(myDOFs[i])) {
                    newList.push(myDOFs[i]);
                }
            }
        }
        else {
            newList = myDOFs; //other is null
        }
        return new DOFSet(newList, dofSetGroup);
    };
    /**
     * Get the DOFs from this set as an array of strings.
     * @returns {string[]}
     */
    this.getDOFs = function () {
        return Object.keys(_dofsSet);
    };
    /**
     * Check if this DOFSet contains a particular DOF.
     * @method jibo.animate.DOFSet#hasDOF
     * @param {string} dofName - DOF name to test for membership in this set.
     * @returns {boolean} true if this DOFSet has this dof.
     */
    this.hasDOF = function (dofName) {
        return _dofsSet.hasOwnProperty(dofName);
    };
    this.createFromDofs = function (dofs) {
        return new DOFSet(dofs, dofSetGroup);
    };
};
/**
 * @callback jibo.animate.DOFSet~DOFSetLoadCallback
 * @param {Object.<string, DOFSet>} allDOFSets - Set of all DOFSets, or null if load failed.
 * @param {string} errorMessage - Error message if error occurred.
 * @private
 */
/**
 *
 * @param {string} url
 * @param {DOFSetLoadCallback} callback
 * @private
 */
DOFSet.load = function (url, callback) {
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            var allDOFSets = DOFSet.createDOFSetsFromJSON(data);
            if (callback) {
                callback(allDOFSets, null);
            }
        }
        else {
            if (callback) {
                callback(null, error);
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @return {Object.<string, DOFSet>}
 * @private
 */
DOFSet.createDOFSetsFromJSON = function (jsonData) {
    var i;
    if (jsonData.header.fileType !== "DOFSets") {
        slog(channel, "DOFSet doesn't know how to parse file with type " + jsonData.header.fileType);
    }
    /** @type {Object.<string, string[]>} */
    var jsonDOFSets = jsonData.content.DOFSets;
    var names = Object.keys(jsonDOFSets);
    /** @type {Object.<string, DOFSet>} */
    var allDOFSets = {};
    for (i = 0; i < names.length; i++) {
        allDOFSets[names[i]] = new DOFSet(jsonDOFSets[names[i]], allDOFSets);
    }
    if (jsonData.content.hasOwnProperty("CompoundSets")) {
        //CompoundSets should be a map from DOFSet names (name of set being created)
        //to names of basic DOFSets defined in the DOFSet map above
        // (previously defined CompoundSets are also ok, if they are defined earlier in the file)
        //all names in a single compound will be combined into one set
        var compoundSets = jsonData.content.CompoundSets;
        var compoundNames = Object.keys(compoundSets);
        for (i = 0; i < compoundNames.length; i++) {
            var combineTheseSets = compoundSets[compoundNames[i]];
            var cs = new DOFSet(null, allDOFSets);
            for (var c = 0; c < combineTheseSets.length; c++) {
                var basicSet = combineTheseSets[c];
                if (allDOFSets.hasOwnProperty(basicSet)) {
                    cs = cs.plus(allDOFSets[basicSet]);
                }
                else {
                    slog(channel, "Error, compound DOFSet " + compoundNames[i] + " requested basic set " + basicSet + " but it is not present in file");
                }
            }
            allDOFSets[compoundNames[i]] = cs;
        }
    }
    return allDOFSets;
};
module.exports = DOFSet;

},{"../ifr-core/FileTools":54,"../ifr-core/SLog":57}],46:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var TranslationControl = require("../ifr-motion/dofs/TranslationControl");
var EyeKinematicsHelper = {};
/**
 * Compute the vertex positions that would result from the given set of dof
 * values, and return them in a map (does not actually move the vertices).
 *
 * Keys of dofValues argument are expected to be DOF names; keys of the
 * returned map are the vertex names.
 *
 * Only gets values from TranslationControl types
 *
 * @param {Object.<string, Object>} dofValues
 * @param {RobotInfo} robotInfo - use the eye dof controls from this robot info to compute the values
 * @return {Object.<string, THREE.Vector3>} map from vertices to local positions
 */
EyeKinematicsHelper.verticesForDOFValues = function (dofValues, robotInfo) {
    /** @type {ModelControlGroup} */
    var eyeControlGroup = robotInfo.getKinematicInfo().getEyeControlGroup();
    var vertexMap = {};
    var controlList = eyeControlGroup.getControlList();
    for (var i = 0; i < controlList.length; i++) {
        var control = controlList[i];
        if (control instanceof TranslationControl) {
            vertexMap[control._skeletonFrameName] = control.computeFromDOFValues(dofValues, true);
        }
    }
    return vertexMap;
};
module.exports = EyeKinematicsHelper;

},{"../ifr-motion/dofs/TranslationControl":90}],47:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
/**
 *
 * @param {number} eyeScreenWidth - width of eye screen billboard in m
 * @param {number} eyeScreenHeight - height of eye screen billboard in m
 * @param {string} eyeScreenBillboardMeshName - name of eye screen billboard mesh
 * @constructor
 */
var EyeScreenInfo = function (eyeScreenWidth, eyeScreenHeight, eyeScreenBillboardMeshName) {
    /** @type {number} */
    this.eyeScreenWidth = eyeScreenWidth;
    /** @type {number} */
    this.eyeScreenHeight = eyeScreenHeight;
    /** @type {string} */
    this.eyeScreenBillboardMeshName = eyeScreenBillboardMeshName;
};
/**
 * @returns {number} - width of screen in m
 */
EyeScreenInfo.prototype.getWidth = function () {
    return this.eyeScreenWidth;
};
/**
 * @returns {number} - height of screen in m
 */
EyeScreenInfo.prototype.getHeight = function () {
    return this.eyeScreenHeight;
};
/**
 *
 * @returns {string} - name of screen billboard mesh (mesh in main hierarchy that eye graphics are texture onto)
 */
EyeScreenInfo.prototype.getEyeScreenBillboardMeshName = function () {
    return this.eyeScreenBillboardMeshName;
};
module.exports = EyeScreenInfo;

},{}],48:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
/**
 * @param {string} [baseGeometryURL] - base geometry config directory
 * @param {string} [robotVersion] - robot version identifier
 * @constructor
 */
var JiboConfig = function (baseGeometryURL, robotVersion) {
    var baseAssetURL = baseGeometryURL;
    if (baseAssetURL === undefined) {
        var findRoot = "find-root";
        findRoot = require(findRoot);
        baseAssetURL = findRoot(__dirname) + "/res/geometry-config/";
    }
    var robot = (robotVersion !== undefined) ? robotVersion : "P1.0";
    var robotURL = baseAssetURL + robot + "/";
    var bodyGeometryURL = robotURL + "jibo_body.geom";
    var bodySkeletonURL = robotURL + "jibo_body.skel";
    var bodyKinematicsURL = robotURL + "jibo_body.kin";
    var fullGeometryURL = robotURL + "jibo_joined.geom";
    var fullSkeletonURL = robotURL + "jibo_joined.skel";
    var fullKinematicsURL = robotURL + "jibo_joined.kin";
    var eyeGeometryURL = robotURL + "jibo_eye.geom";
    var eyeSkeletonURL = robotURL + "jibo_eye.skel";
    var eyeKinematicsURL = robotURL + "jibo_eye.kin";
    var sceneInfoURL = robotURL + "jibo.jscene";
    var dofGroupsURL = robotURL + "jibo.dofgroups";
    var limitsURL = robotURL + "jibo.lim";
    var defaultNormalURL = robotURL + "defaultNormalMap.png";
    /**
     * @return {string}
     */
    this.getRobotURL = function () { return robotURL; };
    /**
     * @return {string}
     */
    this.getBodyGeometryURL = function () { return bodyGeometryURL; };
    /**
     * @return {string}
     */
    this.getBodySkeletonURL = function () { return bodySkeletonURL; };
    /**
     * @return {string}
     */
    this.getBodyKinematicsURL = function () { return bodyKinematicsURL; };
    /**
     * @return {string}
     */
    this.getFullGeometryURL = function () { return fullGeometryURL; };
    /**
     * @return {string}
     */
    this.getFullSkeletonURL = function () { return fullSkeletonURL; };
    /**
     * @return {string}
     */
    this.getFullKinematicsURL = function () { return fullKinematicsURL; };
    /**
     * @return {string}
     */
    this.getEyeGeometryURL = function () { return eyeGeometryURL; };
    /**
     * @return {string}
     */
    this.getEyeSkeletonURL = function () { return eyeSkeletonURL; };
    /**
     * @return {string}
     */
    this.getEyeKinematicsURL = function () { return eyeKinematicsURL; };
    /**
     * @return {string}
     */
    this.getSceneInfoURL = function () { return sceneInfoURL; };
    /**
     * @return {string}
     */
    this.getDOFGroupsURL = function () { return dofGroupsURL; };
    /**
     * @return {string}
     */
    this.getLimitsURL = function () { return limitsURL; };
    /**
     * @return {string}
     */
    this.getDefaultNormalMap = function () { return defaultNormalURL; };
};
module.exports = JiboConfig;

},{}],49:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var KinematicsLoader = require("../ifr-motion/loaders/KinematicsLoader");
var AnimationLoader = require("../ifr-motion/loaders/AnimationLoader");
var LimitsLoader = require("../ifr-motion/loaders/LimitsLoader");
var SkeletonLoader = require("../ifr-geometry/loaders/SkeletonLoader");
var SceneInfo = require("./SceneInfo");
var KinematicGroup = require("../ifr-motion/dofs/KinematicGroup");
var InterpolatorSet = require("../ifr-motion/base/InterpolatorSet");
var SeriesAlignedAxesTargetSelector = require("../ifr-motion/base/SeriesAlignedAxesTargetSelector");
var ModelControlGroup = require("../ifr-motion/dofs/ModelControlGroup");
var DOFGlobalAlignment = require("../ifr-motion/base/DOFGlobalAlignment");
var EyeScreenInfo = require("./EyeScreenInfo");
var Pose = require("../ifr-motion/base/Pose");
var DOFSet = require("./DOFSet");
var slog = require("../ifr-core/SLog");
var channel = "MODEL_LOADING";
/**
 * @param {JiboConfig} jiboConfig
 * @constructor
 */
var JiboKinematicInfo = function (jiboConfig) {
    /** @type {JiboConfig} */
    this._config = jiboConfig;
    /** @type {ModelControlGroup} */
    this._bodyControlGroup = null;
    /** @type {ModelControlGroup} */
    this._eyeControlGroup = null;
    /** @type {ModelControlGroup} */
    this._fullControlGroup = null;
    /** @type {string[]} */
    this._bodyDOFNames = [];
    /** @type {string[]} */
    this._eyeDOFNames = [];
    /** @type {string[]} */
    this._dofNames = [];
    /** @type {InterpolatorSet} */
    this._interpolatorSet = new InterpolatorSet();
    /** @type {KinematicGroup} */
    this._bodyKinematicGroup = null;
    /** @type {KinematicGroup} */
    this._fullKinematicGroup = null;
    /** @type {Motion} */
    this._defaultAnimation = null;
    /** @type {Pose} */
    this._defaultPose = null;
    /** @type {!boolean} */
    this.loadSucceeded = false;
    /** @type {string} */
    this.loadMessage = "";
    /** @type {EyeScreenInfo} */
    this._eyeScreenInfo = null;
    /** @type {Object.<string, DOFSet>} */
    this._dofSets = null;
    /** @type {DOFGlobalAlignment} */
    this._dofGlobalAlignment = null;
};
JiboKinematicInfo.prototype.load = function (callback) {
    var self = this;
    var pending = [];
    var callbacksDone = null;
    var anyFailed = false;
    var bodySkeletonRoot = null;
    var fullSkeletonRoot = null;
    /** @type {Object.<string, Object>} */
    var dofLimits = null;
    //register that a callback is going to happen, so we can wait for it, and also note when it happens
    var getCallback = function (identifier, internalCallback) {
        if (pending.indexOf(identifier) >= 0) {
            throw new Error("JiboKinematicInfo:Cannot queue 2 loads with the same identifier (" + identifier + ")");
        }
        pending.push(identifier);
        //slog(channel, "JiboKinematicInfo:Queuing load of "+identifier);
        return function () {
            var index = pending.indexOf(identifier);
            if (index === -1) {
                slog(channel, "JiboKinematicInfo:Error, callback \"" + identifier + "\" called but not currently pending.");
            }
            else {
                //slog(channel, "JiboKinematicInfo:Unqueuing load of "+identifier+" ("+pending.length+" remain)");
                pending.splice(index, 1);
            }
            if (internalCallback) {
                internalCallback.apply(this, arguments);
            }
            if (pending.length === 0) {
                //slog(channel, "JiboKinematicInfo:No more loads queued.  Calling final setup");
                callbacksDone();
            }
        };
    };
    //called when all pending callbacks have completed
    callbacksDone = function () {
        if (!anyFailed) {
            self.loadSucceeded = true;
            // concatenate the dof names
            self._dofNames = self._bodyDOFNames.concat(self._eyeDOFNames);
            //init pose's knowledge of total available dofs for array optimization
            if (Pose.hasOwnProperty("__globalSetup")) {
                Pose.__globalSetup(self._dofNames);
            }
            //set up the kinematic groups
            self._bodyKinematicGroup = new KinematicGroup(self._bodyControlGroup.getCopy(), bodySkeletonRoot);
            //new array combining the 2 lists, and corresponding controls/kinematic group
            var fullControlsList = self._eyeControlGroup.getControlList().concat(self._bodyControlGroup.getControlList());
            self._fullControlGroup = new ModelControlGroup();
            self._fullControlGroup.setControlList(fullControlsList);
            self._fullKinematicGroup = new KinematicGroup(self._fullControlGroup.getCopy(), fullSkeletonRoot);
            //set the default pose
            self._defaultPose = new Pose("default pose", self._dofNames);
            self._defaultAnimation.getPoseAtTime(self._defaultAnimation.getDuration() / 2, self._interpolatorSet, self._defaultPose);
            for (var dofIndex = 0; dofIndex < self._dofNames.length; dofIndex++) {
                if (self._defaultPose.get(self._dofNames[dofIndex], 0) === null) {
                    self.loadMessage = "default animation has no value for DOF: " + self._dofNames[dofIndex];
                    self.loadSucceeded = false;
                    break;
                }
            }
            //TODO: load this info from file
            self._dofGlobalAlignment = new DOFGlobalAlignment(self._fullKinematicGroup, {
                middleSection_r: new SeriesAlignedAxesTargetSelector("middleSection_r", ["bottomSection_r"], [1]),
                topSection_r: new SeriesAlignedAxesTargetSelector("topSection_r", ["middleSection_r", "bottomSection_r"], [1, 1])
            });
            //add the limits info
            var limitsDOFNames = Object.keys(dofLimits);
            for (var limitIndex = 0; limitIndex < limitsDOFNames.length; limitIndex++) {
                var info = self._fullControlGroup.getDOFInfo(limitsDOFNames[limitIndex]);
                info.setLimitData(dofLimits[limitsDOFNames[limitIndex]]);
            }
        }
        else {
            self.loadSucceeded = false;
        }
        if (callback) {
            callback();
        }
    };
    var kinematicsLoader = new KinematicsLoader();
    //use an outstanding callback to ensure load cannot finish until all loads are queued
    var allQueuedCallback = getCallback("Ensure All Loads Queued", null);
    kinematicsLoader.load(self._config.getBodyKinematicsURL(), getCallback("Body Kinematics", function () {
        var kinematicsResult = kinematicsLoader.getResult();
        if (kinematicsResult.success) {
            self._bodyControlGroup = kinematicsResult.modelControlGroup;
            self._bodyDOFNames = self._bodyControlGroup.getDOFNames();
            self._interpolatorSet.addModelControlGroup(self._bodyControlGroup);
        }
        else {
            anyFailed = true;
            self.loadMessage = "body kinematics load failed with message: " + kinematicsResult.message + ", URL = " + kinematicsResult.url;
        }
    }));
    kinematicsLoader.load(self._config.getEyeKinematicsURL(), getCallback("Eye Kinematics", function () {
        var kinematicsResult = kinematicsLoader.getResult();
        if (kinematicsResult.success) {
            self._eyeControlGroup = kinematicsResult.modelControlGroup;
            self._eyeDOFNames = self._eyeControlGroup.getDOFNames();
            self._interpolatorSet.addModelControlGroup(self._eyeControlGroup);
        }
        else {
            anyFailed = true;
            self.loadMessage = "eye kinematics load failed with message: " + kinematicsResult.message + ", URL = " + kinematicsResult.url;
        }
    }));
    /** @type {SkeletonLoader} */
    var bodySkeletonLoader = new SkeletonLoader();
    bodySkeletonLoader.load(self._config.getBodySkeletonURL(), getCallback("Body Skeleton", function () {
        var bodySkeletonResult = bodySkeletonLoader.getResult();
        if (bodySkeletonResult.success) {
            bodySkeletonRoot = bodySkeletonResult.skeletonRoot;
        }
        else {
            anyFailed = true;
            self.loadMessage = "body skeleton load failed with message: " + bodySkeletonResult.message + ", URL = " + bodySkeletonResult.url;
        }
    }));
    /** @type {SkeletonLoader} */
    var fullSkeletonLoader = new SkeletonLoader();
    fullSkeletonLoader.load(self._config.getFullSkeletonURL(), getCallback("Full Skeleton", function () {
        var fullSkeletonResult = fullSkeletonLoader.getResult();
        if (fullSkeletonResult.success) {
            fullSkeletonRoot = fullSkeletonResult.skeletonRoot;
        }
        else {
            anyFailed = true;
            self.loadMessage = "full skeleton load failed with message: " + fullSkeletonResult.message + ", URL = " + fullSkeletonResult.url;
        }
    }));
    var animationLoader = new AnimationLoader();
    animationLoader.load(self._config.getRobotURL() + "jibo_default.anim", getCallback("Default Animation", function () {
        var animationResult = animationLoader.getResult();
        if (animationResult.success) {
            self._defaultAnimation = animationResult.motion;
        }
        else {
            anyFailed = true;
            self.loadMessage = "default animation load failed with message: " + animationResult.message + ", URL = " + animationResult.url;
        }
    }));
    var sceneInfo = new SceneInfo();
    sceneInfo.load(self._config.getSceneInfoURL(), getCallback("Scene Info", function () {
        if (sceneInfo.loadSucceeded) {
            self._eyeScreenInfo = new EyeScreenInfo(sceneInfo.faceScreenWidth, sceneInfo.faceScreenHeight, sceneInfo.faceScreenMeshName);
        }
        else {
            anyFailed = true;
            self.loadMessage = "scene info failed with load message: " + sceneInfo.loadMessage + ", URL = " + self._config.getSceneInfoURL();
        }
    }));
    DOFSet.load(self._config.getDOFGroupsURL(), getCallback("DOF Groups", function (allDOFSets, errorMessage) {
        if (allDOFSets != null) {
            self._dofSets = allDOFSets;
        }
        else {
            anyFailed = true;
            self.loadMessage = "DOF Groups failed with load message: " + errorMessage + ", URL = " + self._config.getDOFGroupsURL();
        }
    }));
    var limitsLoader = new LimitsLoader();
    limitsLoader.load(self._config.getLimitsURL(), getCallback("Limits", function () {
        var limitsResult = limitsLoader.getResult();
        if (limitsResult.success) {
            dofLimits = limitsResult.dofLimits;
        }
        else {
            anyFailed = true;
            self.loadMessage = "limits data load failed with message: " + limitsResult.message + ", URL = " + limitsResult.url;
        }
    }));
    //This must be called after all loads queued
    allQueuedCallback();
};
/**
 * @return {ModelControlGroup}
 */
JiboKinematicInfo.prototype.getBodyControlGroup = function () {
    return this._bodyControlGroup;
};
/**
 * @return {ModelControlGroup}
 */
JiboKinematicInfo.prototype.getEyeControlGroup = function () {
    return this._eyeControlGroup;
};
/**
 * @return {ModelControlGroup}
 */
JiboKinematicInfo.prototype.getFullControlGroup = function () {
    return this._fullControlGroup;
};
/**
 * @return {string[]}
 */
JiboKinematicInfo.prototype.getBodyDOFNames = function () {
    return this._bodyDOFNames;
};
/**
 * @return {string[]}
 */
JiboKinematicInfo.prototype.getEyeDOFNames = function () {
    return this._eyeDOFNames;
};
/**
 * @return {string[]}
 */
JiboKinematicInfo.prototype.getDOFNames = function () {
    return this._dofNames;
};
/**
 * @return {KinematicGroup}
 */
JiboKinematicInfo.prototype.getFullKinematicGroup = function () {
    return this._fullKinematicGroup;
};
/**
 * @return {KinematicGroup}
 */
JiboKinematicInfo.prototype.getBodyKinematicGroup = function () {
    return this._bodyKinematicGroup;
};
/**
 * @return {InterpolatorSet}
 */
JiboKinematicInfo.prototype.getInterpolatorSet = function () {
    return this._interpolatorSet;
};
/**
 * @return {Pose}
 */
JiboKinematicInfo.prototype.getDefaultPose = function () {
    return this._defaultPose;
};
/**
 * @return {EyeScreenInfo}
 */
JiboKinematicInfo.prototype.getEyeScreenInfo = function () {
    return this._eyeScreenInfo;
};
/**
 * @return {Object.<string,DOFSet>}
 */
JiboKinematicInfo.prototype.getDOFSets = function () {
    return this._dofSets;
};
/**
 * @return {DOFGlobalAlignment}
 */
JiboKinematicInfo.prototype.getDOFGlobalAlignment = function () {
    return this._dofGlobalAlignment;
};
module.exports = JiboKinematicInfo;

},{"../ifr-core/SLog":57,"../ifr-geometry/loaders/SkeletonLoader":66,"../ifr-motion/base/DOFGlobalAlignment":71,"../ifr-motion/base/InterpolatorSet":72,"../ifr-motion/base/Pose":78,"../ifr-motion/base/SeriesAlignedAxesTargetSelector":80,"../ifr-motion/dofs/KinematicGroup":84,"../ifr-motion/dofs/ModelControlGroup":87,"../ifr-motion/loaders/AnimationLoader":96,"../ifr-motion/loaders/KinematicsLoader":97,"../ifr-motion/loaders/LimitsLoader":98,"./DOFSet":45,"./EyeScreenInfo":47,"./SceneInfo":51}],50:[function(require,module,exports){
/**
 * @author jg
 */
"use strict";
var JiboConfig = require("./JiboConfig");
var JiboKinematicInfo = require("./JiboKinematicInfo");
var slog = require("../ifr-core/SLog");
var channel = "MODEL_LOADING";
/**
 * Protected constructor for internal use only.
 *
 * RobotInfo provides robot configuration info used by the animate module,
 * including DOF names, default values, and other geometric info. Typically accessed
 * via the animate module's [getRobotInfo]{@link jibo.animate#getRobotInfo} method.
 *
 * @param {JiboConfig} jiboConfig - Protected constructor parameter.
 * @param {JiboKinematicInfo} kinematicInfo - Protected constructor parameter.
 * @class RobotInfo
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var RobotInfo = function (jiboConfig, kinematicInfo) {
    /** @type {JiboConfig} */
    /** @private */
    this._jiboConfig = jiboConfig;
    /** @type {JiboKinematicInfo} */
    /** @private */
    this._kinematicInfo = kinematicInfo;
};
/**
 * @callback RobotInfoCreated
 * @param {RobotInfo} robotInfo - Loaded robot info or null.
 * @private
 */
/**
 * Factory method to create a RobotInfo by loading data from the provided
 * jiboConfig. Callback will be called and will provide the loaded instance
 * as its first argument if loading is successful. Callback will be provided
 * null otherwise.
 *
 * @param {JiboConfig} jiboConfig - Configuration information to load.
 * @param {RobotInfoCreated} creationCompleteCallback - Callback to notify when loading is complete.
 * @private
 */
RobotInfo.createInfo = function (jiboConfig, creationCompleteCallback) {
    if (jiboConfig === undefined || jiboConfig === null) {
        jiboConfig = new JiboConfig();
    }
    var kinematicInfo = new JiboKinematicInfo(jiboConfig);
    kinematicInfo.load(function () {
        if (kinematicInfo.loadSucceeded) {
            creationCompleteCallback(new RobotInfo(jiboConfig, kinematicInfo));
        }
        else {
            slog(channel, "RobotInfo creation failed: " + kinematicInfo.loadMessage);
            creationCompleteCallback(null);
        }
    });
};
/**
 * @returns {JiboKinematicInfo}
 * @private
 */
RobotInfo.prototype.getKinematicInfo = function () {
    return this._kinematicInfo;
};
/**
 * @returns {JiboConfig}
 * @private
 */
RobotInfo.prototype.getConfig = function () {
    return this._jiboConfig;
};
/**
 * Returns the names of all of the DOFs in the robot's body.
 * @method jibo.animate.RobotInfo#getBodyDOFNames
 * @return {string[]}
 */
RobotInfo.prototype.getBodyDOFNames = function () {
    return this._kinematicInfo.getBodyDOFNames();
};
/**
 * Returns the names of all of the DOFs in the robot's eye/face.
 * @method jibo.animate.RobotInfo#getEyeDOFNames
 * @return {string[]}
 */
RobotInfo.prototype.getEyeDOFNames = function () {
    return this._kinematicInfo.getEyeDOFNames();
};
/**
 * Returns the full set of DOF names for the robot.
 * @method jibo.animate.RobotInfo#getDOFNames
 * @return {string[]}
 */
RobotInfo.prototype.getDOFNames = function () {
    return this._kinematicInfo.getDOFNames();
};
/**
 * Returns info about the eye screen.
 * @return {EyeScreenInfo}
 * @private
 */
RobotInfo.prototype.getEyeScreenInfo = function () {
    return this._kinematicInfo.getEyeScreenInfo();
};
/**
 * Returns a DOFInfo report for the specified DOF.
 * @method jibo.animate.RobotInfo#getDOFInfo
 * @param {string} dofName DOF to return a DOFInfo report for.
 * @return {jibo.animate.DOFInfo}
 */
RobotInfo.prototype.getDOFInfo = function (dofName) {
    return this._kinematicInfo.getFullControlGroup().getDOFInfo(dofName);
};
/**
 * Returns a map with the default values for all of the robot's DOFs.
 * @method jibo.animate.RobotInfo#getDefaultDOFValues
 * @return {Object.<string, Object>}
 */
RobotInfo.prototype.getDefaultDOFValues = function () {
    /** @type {Object.<string, Object>} */
    var dofValues = {};
    var defaultPose = this._kinematicInfo.getDefaultPose();
    var dofNames = this.getDOFNames();
    for (var dofIndex = 0; dofIndex < dofNames.length; dofIndex++) {
        var dofName = dofNames[dofIndex];
        dofValues[dofName] = defaultPose.get(dofName, 0);
    }
    return dofValues;
};
/**
 * Returns the full set of DOFSet names for the robot.
 * @method jibo.animate.RobotInfo#getDOFSetNames
 * @return {string[]} Names of DOFSets.
 */
RobotInfo.prototype.getDOFSetNames = function () {
    return Object.keys(this._kinematicInfo.getDOFSets());
};
/**
 * Returns the DOFSet specified by the given name.
 * @method jibo.animate.RobotInfo#getDOFSet
 * @param {string} dofSetName - Name of DOFSet to get.
 * @return {jibo.animate.DOFSet} DOFSet or null if not found.
 */
RobotInfo.prototype.getDOFSet = function (dofSetName) {
    return this._kinematicInfo.getDOFSets()[dofSetName];
};
module.exports = RobotInfo;

},{"../ifr-core/SLog":57,"./JiboConfig":48,"./JiboKinematicInfo":49}],51:[function(require,module,exports){
/**
 * @author mattb
 */
"use strict";
var FileTools = require("../ifr-core/FileTools");
/**
 * @constructor
 */
var SceneInfo = function () {
    /** @type {string} */
    this.faceScreenMeshName = null;
    /** @type {number} */
    this.faceScreenWidth = null;
    /** @type {number} */
    this.faceScreenHeight = null;
    /** @type {string} */
    this.loadURL = null;
    /** @type {!boolean} */
    this.loadSucceeded = false;
    /** @type {string} */
    this.loadMessage = "";
};
/**
 * @param {string} url
 * @param callback
 */
SceneInfo.prototype.load = function (url, callback) {
    this.loadURL = url;
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data);
            if (callback) {
                callback();
            }
        }
        else {
            self.loadSucceeded = false;
            self.loadMessage = error;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 */
SceneInfo.prototype.parseData = function (jsonData) {
    if (jsonData.header.fileType !== "SceneInfo") {
        this.loadSucceeded = false;
        this.loadMessage = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    this.faceScreenMeshName = jsonData.content.faceScreenMeshName;
    this.faceScreenWidth = jsonData.content.faceScreenInternalBounds[0];
    this.faceScreenHeight = jsonData.content.faceScreenInternalBounds[1];
    this.loadSucceeded = true;
};
module.exports = SceneInfo;

},{"../ifr-core/FileTools":54}],52:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("./SLog");
var theBaker = null;
var Bakery = {};
var printedInitializeWarning = false;
/**
 * Initialize the Bakery with a specific Bakery implementation.  This should be called once, the result is cached
 * statically so subsequent calls to getFloat etc. will display their UI via the given implementation.
 *
 * @param {Object} bakeryImplementation
 */
Bakery.init = function (bakeryImplementation) {
    if (theBaker === null) {
        theBaker = bakeryImplementation;
    }
    else {
        slog.warn("Warning, Bakery initialized multiple times!");
        theBaker = bakeryImplementation;
    }
};
var getBaker = function (tabName) {
    return theBaker; //only one baker for now, keeping this function as placeholder for path to baker index.
};
var printUnInitializedWarning = function () {
    if (!printedInitializeWarning) {
        slog.info("Bakery values requested by Bakery never initialized");
        printedInitializeWarning = true;
    }
};
/**
 * First call will initialize/display a slider with the provided name in the
 * tab listed.  If tabName is an array of strings, there will be set of nested
 * tabs.
 * @param {string} name - name of slider
 * @param {number} min - minimum of slider
 * @param {number} max - maximum of slider
 * @param {number} initial - initial value of slider and produced value
 * @param {string | string[]} [tabName] - the tab name (or path) to display the ui in.  put in "default" tab if omitted
 * @returns {number}
 */
Bakery.getFloat = function (name, min, max, initial, tabName) {
    var useBaker = getBaker(tabName);
    if (useBaker !== null) {
        return useBaker.getFloat(name, min, max, initial, tabName);
    }
    else {
        printUnInitializedWarning();
        return initial;
    }
};
/**
 * First call will initialize/display a checkbox with the provided name in the
 * tab listed.  If tabName is an array of strings, there will be set of nested
 * tabs.
 * @param {string} name - name of checkbox
 * @param {boolean} initial - initial value of checkbox and produced value
 * @param {string | string[]} [tabName] - the tab name (or path) to display the ui in.  put in "default" tab if omitted
 * @returns {boolean}
 */
Bakery.getBoolean = function (name, initial, tabName) {
    var useBaker = getBaker(tabName);
    if (useBaker !== null) {
        return useBaker.getBoolean(name, initial, tabName);
    }
    else {
        printUnInitializedWarning();
        return initial;
    }
};
/**
 * First call will initialize/display a button with the provided name in the
 * tab listed.  If tabName is an array of strings, there will be set of nested
 * tabs.
 * @param {string} name - name of button
 * @param callback - callback called when button pressed
 * @param {string | string[]} [tabName] - the tab name (or path) to display the ui in.  put in "default" tab if omitted
 */
Bakery.makeButton = function (name, callback, tabName) {
    var useBaker = getBaker(tabName);
    if (useBaker !== null) {
        useBaker.makeButton(name, callback, tabName);
    }
    else {
        printUnInitializedWarning();
    }
};
/**
 * First call will initialize/display a text label with provided text.
 * (label:text).  Subsequent calls change the text.
 *
 * @param {string} name - name of label, will show up in the display
 * @param {string} text - text to show
 * @param {string | string[]} [tabName] - the tab name (or path) to display the ui in.  put in "default" tab if omitted
 */
Bakery.showText = function (name, text, tabName) {
    var useBaker = getBaker(tabName);
    if (useBaker !== null) {
        useBaker.showText(name, text, tabName);
    }
    else {
        printUnInitializedWarning();
    }
};
/**
 * Get the currently-installed Bakery implementation (may be null).
 *
 * @param {string | string[]} [tabName] - the tab name (or path) of the desired Baker
 * @returns {?} The currently-installed Bakery implementation.
 */
Bakery.getBaker = function (tabName) {
    return getBaker(tabName);
};
module.exports = Bakery;

},{"./SLog":57}],53:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Time = require("./Time");
/**
 * A high-precision clock.  Uses the Performance API if available.
 *
 * @class Clock
 * @memberof jibo.animate
 */
var Clock = {};
/**
 * Gets the current time.
 *
 * Internally, time is calculated as time since epoch and is
 * represented as two integers— seconds and fractions of a second in microseconds.
 * @method jibo.animate.Clock#currentTime
 * @returns {jibo.animate.Time}
 */
Clock.currentTime = function () {
    var sinceNavStart;
    var navStartMS;
    if (typeof (window) !== "undefined" && typeof (window.performance) !== "undefined") {
        sinceNavStart = window.performance.now();
        navStartMS = window.performance.timing.navigationStart;
    }
    else {
        sinceNavStart = 0;
        navStartMS = Date.now();
    }
    var sinceStartMSComponent = Math.floor(sinceNavStart);
    var sinceStartFractionalMSComponent = sinceNavStart - sinceStartMSComponent;
    //break off sub-ms part for later addition (don't want to lose precision)
    //our stamp is startTimeMS + elapsedMS
    var timeStampMSComponent = sinceStartMSComponent + navStartMS;
    //break off and remove whole seconds
    var timeStampSComponent = Math.floor(timeStampMSComponent / 1000);
    timeStampMSComponent -= timeStampSComponent * 1000;
    //add back in the sub-ms elapsed component
    var timeStampFractionalComponent = timeStampMSComponent + sinceStartFractionalMSComponent;
    //convert to us
    timeStampFractionalComponent = Math.round(timeStampFractionalComponent * 1000);
    //us rounded up and need to carry into s
    if (timeStampFractionalComponent === 1000000) {
        timeStampFractionalComponent = 0;
        timeStampSComponent = timeStampSComponent + 1;
    }
    return new Time(timeStampSComponent, timeStampFractionalComponent);
};
module.exports = Clock;

},{"./Time":58}],54:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var URI = require("urijs");
var FileTools = {};
/**
 * @callback FileLoadCallback
 * @param {string} error - error message, null if file load succeeded
 * @param {*} data - loaded file contents
 * @intdocs
 */
/**
 * Load text data from a URL.
 * @param {string} url
 * @param {FileLoadCallback} callback
 */
FileTools.loadText = function (url, callback) {
    var uri = new URI(url);
    // bypass the cache
    uri.addQuery("" + (new Date().getTime()));
    // if no protocol, force it to be the file protocol, as the XMLHttpRequest polyfill provided by
    // jibo-service-clients needs the protocol to be file: to actually do a file system load
    if (uri.protocol() === "") {
        uri = uri.protocol("file");
    }
    if (typeof (XMLHttpRequest) !== "undefined") {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", uri.toString(), true);
        xhr.addEventListener("load", function (event) {
            if (callback) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(null, xhr.responseText);
                }
                else {
                    callback("FileTools: XMLHttpRequest failed with status: " + xhr.statusText, null);
                }
            }
        }, false);
        xhr.addEventListener("error", function (event) {
            if (callback) {
                callback("FileTools: XMLHttpRequest error event with status: " + xhr.statusText, null);
            }
        }, false);
        xhr.send(null);
    }
    else if (uri.protocol() === "http") {
        var http = "http";
        http = require(http);
        var options = {
            host: uri.hostname(),
            port: (uri.port() ? parseInt(uri.port()) : 80),
            path: uri.resource(),
            method: "GET"
        };
        var request = http.request(options, function (result) {
            if (result.statusCode === 200) {
                result.setEncoding("utf8");
                result.on("data", function (chunk) {
                    if (callback) {
                        callback(null, chunk);
                    }
                });
            }
            else {
                if (callback) {
                    callback("FileTools: http request failed with status code: " + result.statusCode, null);
                }
            }
        });
        request.on("error", function (e) {
            if (callback) {
                callback(e.message, null);
            }
        });
        request.end();
    }
    else if (uri.protocol() === "file" || uri.protocol() === "") {
        var fs = "fs";
        fs = require(fs);
        fs.readFile(uri.path(), "utf8", callback);
    }
    else {
        // unsupported protocol
        if (callback) {
            callback("FileTools: no XMLHttpRequest available, and no fallback support for protocol: " + uri.protocol(), null);
        }
    }
};
/**
 * Load JSON data from a URL.
 * @param {string} url
 * @param {FileLoadCallback} callback
 */
FileTools.loadJSON = function (url, callback) {
    FileTools.loadText(url, function (error, data) {
        if (callback) {
            if (error) {
                callback(error, null);
            }
            else {
                var jsonData = null;
                var parseError = false;
                var parseErrorMessage = "";
                try {
                    jsonData = JSON.parse(data);
                }
                catch (e) {
                    parseError = true;
                    parseErrorMessage = e;
                }
                if (!parseError) {
                    callback(null, jsonData);
                }
                else {
                    callback("FileTools: JSON parse error: " + parseErrorMessage, null);
                }
            }
        }
    });
};
module.exports = FileTools;

},{"urijs":undefined}],55:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var FileTools = require("./FileTools");
var slog = require("./SLog");
/**
 * Implementation of the Bakery that provides data from a serialized JSON object.
 *
 * @param {object|string} bakeryData - Bakery data object or URL to load for data.
 * @constructor
 */
var JSONBaker = function (bakeryData) {
    var initData = null;
    var url = null;
    if (typeof bakeryData === "string") {
        url = bakeryData;
    }
    else {
        initData = bakeryData;
    }
    this._dataRoot = {};
    this._defaultScopeName = "default";
    if (initData) {
        this._dataRoot = initData;
    }
    if (url) {
        var self = this;
        FileTools.loadJSON(url, function (error, data) {
            if (error) {
                slog.error("JSONBaker: failed to load data, url: " + url + " error: " + error);
            }
            else {
                self._dataRoot = data;
            }
        });
    }
};
JSONBaker.prototype._getScope = function (tabName) {
    if (!tabName) {
        tabName = this._defaultScopeName;
    }
    if (tabName instanceof Array) {
        var scope = this._dataRoot;
        for (var i = 0; i < tabName.length; i++) {
            if (typeof scope[tabName[i]] !== "object") {
                scope[tabName[i]] = {};
            }
            scope = scope[tabName[i]];
        }
        return scope;
    }
    else {
        if (typeof this._dataRoot[tabName] !== "object") {
            this._dataRoot[tabName] = {};
        }
        return this._dataRoot[tabName];
    }
};
JSONBaker.prototype.getFloat = function (name, min, max, initial, tabName) {
    var scope = this._getScope(tabName);
    var value = scope[name];
    if (value === undefined || value === null) {
        value = initial;
        scope[name] = value;
    }
    return value;
};
JSONBaker.prototype.getBoolean = function (name, initial, tabName) {
    var scope = this._getScope(tabName);
    var value = scope[name];
    if (value === undefined || value === null) {
        value = initial;
        scope[name] = value;
    }
    return value;
};
JSONBaker.prototype.makeButton = function (name, callback, tabName) {
};
JSONBaker.prototype.showText = function (name, text, tabName) {
};
JSONBaker.prototype.getData = function () {
    return this._dataRoot;
};
JSONBaker.prototype.setProperty = function (property, value) {
    var elements = property.split('/');
    var name = elements[elements.length - 1];
    var tabName = null;
    if (elements.length > 1) {
        tabName = elements.slice(0, elements.length - 1);
    }
    var scope = this._getScope(tabName);
    scope[name] = value;
};
module.exports = JSONBaker;

},{"./FileTools":54,"./SLog":57}],56:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var slog = require("./SLog");
/**
 * @param {string} url - socket URL
 * @param {string|string[]} [protocolInfo] - optional sub-protocol info string(s)
 * @param {number} [reconnectDelayMillis] - optional milliseconds to wait before attempting reconnect, -1 to disable reconnect
 * @param {string} [channelName] - optional debugging channel name
 * @constructor
 */
var ReconnectingWebSocket = function (url, protocolInfo, reconnectDelayMillis, channelName) {
    /** @type {string} */
    this._url = url;
    /** @type {string|string[]} */
    this._protocolInfo = protocolInfo || null;
    /** @type {string} */
    this._channelName = channelName || "SOCKET";
    /** @type {number} */
    this._reconnectDelayMillis = 3000;
    if (reconnectDelayMillis !== null && reconnectDelayMillis !== undefined) {
        this._reconnectDelayMillis = reconnectDelayMillis;
    }
    this._originalReconnectDelayMillis = this._reconnectDelayMillis;
    /** @type {WebSocket} */
    this._socket = null;
    /** @type {Object<string,function[]>} */
    this._listenerMap = {};
    /** @type {boolean} */
    this._shouldClose = false;
    /** @type {number} */
    this._sendsSinceLastFailure = 0;
    /** @type {number} */
    this._sequentialSocketFailures = 0;
    this._connect();
};
/**
 * @return {boolean} - true if the socket is open and ready to communicate
 */
ReconnectingWebSocket.prototype.isConnected = function () {
    return this._socket !== null && this._socket.readyState === WebSocket.OPEN;
};
/**
 * Adds a callback for the specified event type.
 * @param {string} eventType
 * @param {function} callback
 */
ReconnectingWebSocket.prototype.on = function (eventType, callback) {
    if (!this._listenerMap.hasOwnProperty(eventType)) {
        this._listenerMap[eventType] = [];
    }
    this._listenerMap[eventType].push(callback);
};
/**
 * Removes a callback for the specified event type.
 * @param {string} eventType
 * @param {function} callback
 */
ReconnectingWebSocket.prototype.off = function (eventType, callback) {
    var listeners = this._listenerMap[eventType];
    if (listeners && listeners.indexOf(callback) !== -1) {
        listeners.splice(listeners.indexOf(callback), 1);
    }
};
/**
 * Sends data via this socket.
 * @param {string} data
 */
ReconnectingWebSocket.prototype.send = function (data) {
    if (this.isConnected()) {
        //reach into the socket state to see if it is hanging - we don't know why that would be,
        //but we can at least avoid eating all the memory on the robot, if possible
        //this._socket is a WebSocket (coming from the `ws` package, because the SSM overrides it)
        //its _socket property is a node Socket.
        if (this._socket._socket._writableState.bufferedRequestCount > 5) {
            //if there are buffered requests, which doesn't happen under normal circumstances,
            //then close the socket
            this.close();
            //if we haven't been able to send anything for a while, then just give up
            if (++this._sequentialSocketFailures >= 12) {
                slog.error("ReconnectingWebSocket has failed too many times for " + this._url + " and is giving up.");
                return;
            }
            //record our failure
            this._sendsSinceLastFailure = 0;
            slog.warn("ReconnectingWebSocket has been unable to send to " + this._url + ", attempting to reconnect.");
            //reset our closing
            this._shouldClose = false;
            //give it 15 seconds, maybe the service on the other end will recover?
            this._reconnectDelayMillis = 15000;
            //and reconnect
            this._considerReconnect();
        }
        else {
            //socket is fine, send data
            this._socket.send(data);
            //if it actually sent, then keep track of that
            if (this._socket._socket._writableState.bufferedRequestCount === 0) {
                //see if we've been successfully sending things for a bit
                //because we hope this will never break, stop counting after we hit our check,
                //so that we don't cause any problems by running forever and trying to increment to
                //infinity or something
                if (this._sendsSinceLastFailure < 5 && ++this._sendsSinceLastFailure >= 5) {
                    //reset our failure count
                    this._sequentialSocketFailures = 0;
                }
            }
        }
    }
};
/**
 * Closes this socket (and does not attempt to reconnect).
 */
ReconnectingWebSocket.prototype.close = function () {
    this._shouldClose = true;
    this._reconnectDelayMillis = -1;
    if (this._socket !== null) {
        this._socket.close();
    }
};
/**
 * @private
 */
ReconnectingWebSocket.prototype._connect = function () {
    if (!this._shouldClose) {
        if (this._protocolInfo) {
            this._socket = new WebSocket(this._url, this._protocolInfo);
        }
        else {
            this._socket = new WebSocket(this._url);
        }
        this._socket.onopen = this._openHappened.bind(this);
        this._socket.onclose = this._closeHappened.bind(this);
        this._socket.onerror = this._errorHappened.bind(this);
        this._socket.onmessage = this._messageHappened.bind(this);
        this._reconnectDelayMillis = this._originalReconnectDelayMillis;
    }
};
/**
 * @private
 */
ReconnectingWebSocket.prototype._considerReconnect = function () {
    if (this._reconnectDelayMillis >= 0 && this._socket !== null) {
        slog(this._channelName, "Scheduling reconnect: " + this._url);
        this._socket.onopen = null;
        this._socket.onclose = null;
        this._socket.onerror = null;
        this._socket.onmessage = null;
        this._socket = null;
        setTimeout(this._connect.bind(this), this._reconnectDelayMillis);
    }
};
/**
 * @param {string} eventType
 * @param {Object} event
 * @private
 */
ReconnectingWebSocket.prototype._fireEvent = function (eventType, event) {
    var listeners = this._listenerMap[eventType];
    if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](event);
        }
    }
};
/**
 * @param {Object} event
 * @private
 */
ReconnectingWebSocket.prototype._openHappened = function (event) {
    slog(this._channelName, "Socket opened: " + this._url);
    this._fireEvent(event.type, event);
};
/**
 * @param {Object} event
 * @private
 */
ReconnectingWebSocket.prototype._closeHappened = function (event) {
    slog(this._channelName, "Socket closed: " + this._url + " code: " + event.code + " reason: " + event.reason + " clean: " + event.wasClean);
    this._fireEvent(event.type, event);
    this._considerReconnect();
};
/**
 * @param {Object} event
 * @private
 */
ReconnectingWebSocket.prototype._errorHappened = function (event) {
    slog(this._channelName, "Socket error: " + this._url);
    this._fireEvent(event.type, event);
    this._considerReconnect();
};
/**
 * @param {Object} event
 * @private
 */
ReconnectingWebSocket.prototype._messageHappened = function (event) {
    this._fireEvent(event.type, event);
};
module.exports = ReconnectingWebSocket;

},{"./SLog":57}],57:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @callback SlogDelegate
 * @param {string} channel
 * @param {string} message
 * @intdocs
 */
/** @type {SlogDelegate} */
// eslint-disable-next-line no-unused-vars
var _slogNOPDelegate = function (channel, message, priority) { };
/** @type {boolean} */
var _printedUninitializedWarning = false;
/** @type {SlogDelegate} */
// eslint-disable-next-line no-unused-vars
var _slogWarnUninitializedDelegate = function (channel, message, priority) {
    if (!_printedUninitializedWarning) {
        _printedUninitializedWarning = true;
        console.log("slog used without being initialized, first usage stack:");
        console.log(new Error().stack);
    }
};
// eslint-disable-next-line no-unused-vars
var _slogConsolePrinterDelegate = function (channel, message, priority) {
    console.log(channel + " : " + message);
};
/** @type {SlogDelegate} */
var _slogSelectedPrinter = _slogConsolePrinterDelegate;
/** @type {SlogDelegate} */
var _slogDefaultDelegate = _slogNOPDelegate;
/** @type {Object.<string, SlogDelegate>} */
var _slogChannelDelegates = { ERROR: _slogSelectedPrinter };
/**
 * @param {string} channel
 * @param {string} message
 * @param {string} [priority]
 */
var slog = function (channel, message, priority) {
    if (_slogChannelDelegates.hasOwnProperty(channel)) {
        _slogChannelDelegates[channel](channel, message, priority);
    }
    else {
        _slogDefaultDelegate(channel, message, priority);
    }
};
/**
 * Enum Values for default channels.
 * @enum {string}
 */
slog.BaseChannels = {
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR"
};
/**
 * Enum Values for priority levels.
 * @enum {string}
 */
slog.Levels = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARN: "WARN",
    ERROR: "ERROR"
};
/**
 * Calls slog(INFO, message).
 *
 * @param {string} message
 */
slog.info = function (message) {
    slog(slog.BaseChannels.INFO, message, slog.Levels.INFO);
};
/**
 * Calls slog(WARN, message).
 *
 * @param {string} message
 */
slog.warn = function (message) {
    slog(slog.BaseChannels.WARN, message, slog.Levels.WARN);
};
/**
 * Calls slog(ERROR, message).
 *
 * @param {string} message
 */
slog.error = function (message) {
    slog(slog.BaseChannels.ERROR, message, slog.Levels.ERROR);
};
/**
 * Sets the default delegate which will handle all channels not explicitly
 * covered by a channel delegate.  Pass null for a NOP handler that prints nothing
 *
 * @param {SlogDelegate} slogDelegate - default delegate, null for NOP (silent) delegate
 */
slog.setDefaultDelegate = function (slogDelegate) {
    if (slogDelegate == null) {
        _slogDefaultDelegate = _slogNOPDelegate;
    }
    else {
        _slogDefaultDelegate = slogDelegate;
    }
};
/**
 * Sets the delegate for a particular channel.  Pass null for a NOP handler that prints nothing
 * @param {string} channel
 * @param {SlogDelegate} slogDelegate - channel delegate, null for NOP (silent) delegate
 */
slog.setChannelDelegate = function (channel, slogDelegate) {
    if (slogDelegate == null) {
        _slogChannelDelegates[channel] = _slogNOPDelegate;
    }
    else {
        _slogChannelDelegates[channel] = slogDelegate;
    }
};
/**
 * Clear the delegate from the given channel (channel will be handled by default delegate).
 * Pass null to clear all channel delegates
 *
 * @param {string} channel - channel to clear, null to clear all channels
 */
slog.clearChannelDelegate = function (channel) {
    if (channel == null) {
        var channels = Object.keys(_slogChannelDelegates);
        for (var i = 0; i < channels.length; i++) {
            delete (_slogChannelDelegates[channels[i]]);
        }
    }
    else {
        delete (_slogChannelDelegates[channel]);
    }
};
/**
 * Set the function that will be used for any channel specified to "print" without a custom delegate.
 * E.g., default behavior if setDefaultPrinting is true, setPrintChannels, setPrintAll, etc.
 *
 * This will be the print function used for any channel/default enabled after this point, it will
 * also be applied to any channel that was printing using the previous selected printer.
 *
 * Pass null to switch to basic console style printing
 *
 * @param printer
 */
slog.setPrinter = function (printer) {
    var newPrinter = printer;
    if (printer == null) {
        newPrinter = _slogConsolePrinterDelegate;
    }
    var currentPrinter = _slogSelectedPrinter;
    //update all current channels to new printer
    if (_slogDefaultDelegate === currentPrinter) {
        _slogDefaultDelegate = newPrinter;
    }
    //update all current channels to new printer if they were using the old printer
    var channels = Object.keys(_slogChannelDelegates);
    for (var i = 0; i < channels.length; i++) {
        if (_slogChannelDelegates[channels[i]] === currentPrinter) {
            _slogChannelDelegates[channels[i]] = newPrinter;
        }
    }
    _slogSelectedPrinter = newPrinter;
};
/**
 * Set the "default" behavior (behavior for channels not explicitly specified) to print or not print
 *
 * @param {boolean} print - true to print channels not explicitly specified, false to not print those channels
 */
slog.setDefaultPrinting = function (print) {
    slog.setDefaultDelegate(print ? _slogSelectedPrinter : _slogNOPDelegate);
};
/**
 * Convenience function to configure slog to print only the channels listed.  Clears all other
 * initialized state.
 *
 * Equivalent to setting the default delegate to NOP delegate, setting the given channels
 * to simple console printing delegates, and clearing all other channel delegates
 *
 * @param {string[]} channels - channels to print, null same as setPrintNone
 */
slog.setPrintChannels = function (channels) {
    slog.setDefaultDelegate(null);
    slog.clearChannelDelegate(null);
    if (channels != null) {
        for (var i = 0; i < channels.length; i++) {
            slog.setChannelDelegate(channels[i], _slogSelectedPrinter);
        }
    }
};
/**
 *
 * @param {string[]} channels - channels to add to set that will print
 */
slog.addPrintChannels = function (channels) {
    if (channels != null) {
        for (var i = 0; i < channels.length; i++) {
            slog.setChannelDelegate(channels[i], _slogSelectedPrinter);
        }
    }
};
/**
 *
 * @param {string[]} channels - channels to remove to set that will print
 */
slog.removePrintChannels = function (channels) {
    if (channels != null) {
        for (var i = 0; i < channels.length; i++) {
            slog.setChannelDelegate(channels[i], _slogNOPDelegate);
        }
    }
};
/**
 * Convenience function to configure slog to print all channels.  Clears all other
 * initialized state.
 *
 * Equivalent to setting the default delegate to a simple console printing delegate
 * and clearing all channel delegates
 */
slog.setPrintAll = function () {
    slog.setDefaultDelegate(_slogSelectedPrinter);
    slog.clearChannelDelegate(null);
};
/**
 * Convenience function to configure slog to print nothing.  Clears all other
 * initialized state.
 *
 * Equivalent to setting the default delegate to a NOP delegate
 * and clearing all channel delegates
 */
slog.setPrintNone = function () {
    slog.setDefaultDelegate(_slogNOPDelegate);
    slog.clearChannelDelegate(null);
};
/**
 *
 * @param {function} debug - send enabled debug channels to this function
 * @param {function} info - send enabled info channels to this function
 * @param {function} warnings - enable warnings and send them to this function (if non-null)
 * @param {function} errors - enable errors and send them to this function (if non-null)
 */
slog.wrapLog = function (debug, info, warnings, errors) {
    slog.setPrinter((channel, message, priority) => {
        if (priority === slog.Levels.DEBUG) {
            debug(channel, message);
        }
        else if (priority === undefined || priority === slog.Levels.INFO) {
            info(channel, message);
        }
        else if (priority === slog.Levels.WARN) {
            warnings(channel, message);
        }
        else if (priority === slog.Levels.ERROR) {
            errors(channel, message);
        }
    });
    //Keep these WARN/ERROR channels up for backwards compatibility
    // also, send all channel messages into the eponymous priority
    // eslint-disable-next-line no-unused-vars
    slog.setChannelDelegate(slog.BaseChannels.WARN, (channel, message, priority) => {
        warnings(channel, message);
    });
    // eslint-disable-next-line no-unused-vars
    slog.setChannelDelegate(slog.BaseChannels.ERROR, (channel, message, priority) => {
        errors(channel, message);
    });
};
module.exports = slog;

},{}],58:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @typedef {Array.<number>} jibo.animate.Time~Timestamp - This is a two-element array of integers,
 * representing seconds and fractions of a second in microseconds since epoch. Each are non-negative integer values.
 */
/**
 * @param {jibo.animate.Time~Timestamp} timestamp Time printed as seconds and fractions of a second in microseconds.
 * @returns {boolean} `true` if valid, `false` if invalid (i.e. negative).
 */
var isValid = function (timestamp) {
    var valid = timestamp[0] === +timestamp[0] && timestamp[1] === +timestamp[1] && //values are numbers
        timestamp[0] >= 0 && timestamp[1] >= 0 && //numbers are positive
        timestamp[1] < 1000000 && //micro seconds portion is under a second
        timestamp[0] === Math.round(timestamp[0]) && timestamp[1] === Math.round(timestamp[1]); //values are integers
    if (!valid) {
        if (timestamp[0] !== +timestamp[0] || timestamp[1] !== +timestamp[1]) {
            console.log("InvalidTime: At least one element of timestamp is not a number");
        }
        if (timestamp[0] < 0 || timestamp[1] < 0) {
            console.log("InvalidTime: At least one element of timestamp is negative");
        }
        if (timestamp[1] >= 1000000) {
            console.log("InvalidTime: Microseconds portion is over one second");
        }
        if (timestamp[0] !== Math.round(timestamp[0]) || timestamp[1] !== Math.round(timestamp[1])) {
            console.log("InvalidTime: At least one element is not an integer");
        }
    }
    return valid;
};
/**
 * Represents the time since epoch.
 * @param {number} seconds - Seconds from epoch.
 * @param {number} microseconds - Fractions of a second from epoch in microseconds.
 * @throws {Error} Error if time values are invalid (not numbers, not positive, micros more than 10^6, not integers).
 *
 * @class Time
 * @memberof jibo.animate
 */
var Time = function (seconds, microseconds) {
    /**
     * @type {jibo.animate.Time~Timestamp}
     * @private
     */
    this._timestamp = [seconds, microseconds];
    if (!isValid(this._timestamp)) {
        throw new Error("new Time() given invalid time values: (INVALID " + this._timestamp[0] + ", " + this._timestamp[1] + ")");
    }
};
/**
 * Creates new Time instance from the specified timeStamp.
 * @method jibo.animate.Time.createFromTimestamp
 * @param {jibo.animate.Time~Timestamp} timestamp - Two element-array representing time from epoch, where first element is seconds and the second is fractions of a second in microseconds.
 * @returns {jibo.animate.Time} new Time instance.
 * @throws {Error} Error if timeStamp is invalid (not an array, not numbers, not positive, micros more than 10^6, not integers).
 */
Time.createFromTimestamp = function (timestamp) {
    if (!Array.isArray(timestamp)) {
        throw new Error("new Time() given invalid Timestamp: (INVALID: not array)");
    }
    return new Time(timestamp[0], timestamp[1]);
};
/**
 * Computes the signed seconds between this instance and subtrahendTime, i.e. (this - subtrahend)
 * @method jibo.animate.Time#subtract
 * @param {jibo.animate.Time} subtrahendTime Time to compare this time to.
 * @returns {number} (this - subtrahend), in floating point seconds.
 */
Time.prototype.subtract = function (subtrahendTime) {
    var a, b, n;
    if (this.isGreaterOrEqual(subtrahendTime)) {
        a = this._timestamp;
        b = subtrahendTime._timestamp;
        n = 1;
    }
    else {
        a = subtrahendTime._timestamp;
        b = this._timestamp;
        n = -1;
    }
    var usPart = a[1] - b[1];
    var sPart = a[0] - b[0];
    if (usPart < 0) {
        usPart += 1000000;
        sPart -= 1;
    }
    var r = n * (sPart + (usPart / 1000000));
    return Math.round(r * 1000000) / 1000000; //round off floating noise to be exact microseconds result
};
/**
 * Creates and returns a new Time offset from this instance by the seconds value provided.
 * @method jibo.animate.Time#add
 * @param {number} seconds - Signed seconds value to offset new time by.
 * @returns {jibo.animate.Time} new Time instance equal to this Time offset by signed seconds value.
 * @throws {Error} - Error if resulting timeStamp would have been negative.
 */
Time.prototype.add = function (seconds) {
    var sPart, usPart;
    if (seconds < 0) {
        var toSubSPart = Math.floor(-seconds);
        var toSubFractionPart = -seconds - toSubSPart;
        sPart = this._timestamp[0] - toSubSPart;
        usPart = this._timestamp[1] - toSubFractionPart * 1000000;
        usPart = Math.round(usPart);
        if (usPart < 0) {
            usPart += 1000000;
            sPart -= 1;
        }
        if (sPart < 0) {
            //negative timestamps not supported
            throw new Error("Error, " + this.toString() + "+" + seconds + " is a negative timestamp! (not allowed)");
        }
    }
    else {
        var toAddSPart = Math.floor(seconds);
        var toAddFractionalPart = seconds - toAddSPart;
        sPart = this._timestamp[0] + toAddSPart;
        usPart = this._timestamp[1] + toAddFractionalPart * 1000000;
        usPart = Math.round(usPart);
        if (usPart >= 1000000) {
            usPart -= 1000000;
            sPart += 1;
        }
    }
    return new Time(sPart, usPart);
};
/**
 * Computes if this time instance is later than the provided time, i.e. (this > otherTime).
 * @method jibo.animate.Time#isGreater
 * @param {jibo.animate.Time} otherTime Time to compare this time to.
 * @returns {boolean} `true` if this time is greater (later) than otherTime.
 */
Time.prototype.isGreater = function (otherTime) {
    if (this._timestamp[0] > otherTime._timestamp[0]) {
        return true;
    }
    else if (this._timestamp[0] === otherTime._timestamp[0]) {
        return this._timestamp[1] > otherTime._timestamp[1];
    }
    else {
        return false;
    }
};
/**
 * Computes if this time instance is later or the same as the provided time,
 * i.e. (this >= otherTime).
 * @method jibo.animate.Time#isGreaterOrEqual
 * @param {jibo.animate.Time} otherTime Time to compare this time to.
 * @returns {boolean} `true` if this time is greater than or equal to (later or the same) otherTime.
 */
Time.prototype.isGreaterOrEqual = function (otherTime) {
    if (this._timestamp[0] > otherTime._timestamp[0]) {
        return true;
    }
    else if (this._timestamp[0] === otherTime._timestamp[0]) {
        return this._timestamp[1] >= otherTime._timestamp[1];
    }
    else {
        return false;
    }
};
/**
 * Computes if this time instance represents the same time as the provided time.
 * @method jibo.animate.Time#equals
 * @param {jibo.animate.Time} otherTime Time to compare this time to.
 * @returns {boolean} `true` if this time is the same time as otherTime.
 */
Time.prototype.equals = function (otherTime) {
    return this._timestamp[0] === otherTime._timestamp[0] && this._timestamp[1] === otherTime._timestamp[1];
};
/**
 * Convert time to a string.
 * @method jibo.animate.Time#toString
 * @returns {string} string Representation of this timestamp. Printed as floating point value of seconds since epoch.
 */
Time.prototype.toString = function () {
    var tsUS = "" + this._timestamp[1];
    while (tsUS.length < 6) {
        tsUS = "0" + tsUS;
    }
    return this._timestamp[0] + "." + tsUS;
};
module.exports = Time;

},{}],59:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @typedef {Object} Timer
 * @property {function} stop - stops the timer
 * @intdocs
 */
/**
 * @param {function} callback - the callback
 * @param {number} intervalTimeMillis - interval in milliseconds at which to call the callback
 * @constructor
 */
var BrowserTimer = function (callback, intervalTimeMillis) {
    var intervalHandle = setInterval(callback, intervalTimeMillis);
    this.stop = function () {
        clearInterval(intervalHandle);
    };
};
var workerScript = "" +
    "" + "var timerHandles = {};" + "\n" +
    "" + "self.onmessage = function(event)" + "\n" +
    "" + "{" + "\n" +
    "" + "	var command = event.data.command;" + "\n" +
    "" + "	var callbackID = event.data.callbackID;" + "\n" +
    "" + "	var callbackInterval = event.data.callbackInterval;" + "\n" +
    "" + "	var timerHandle = null;" + "\n" +
    "" + "" + "\n" +
    "" + "	if (command === 'start')" + "\n" +
    "" + "	{" + "\n" +
    "" + "		timerHandle = setInterval(function()" + "\n" +
    "" + "		{" + "\n" +
    "" + "			self.postMessage({callbackID: callbackID});" + "\n" +
    "" + "		}, callbackInterval);" + "\n" +
    "" + "		timerHandles[callbackID] = timerHandle;" + "\n" +
    "" + "	}" + "\n" +
    "" + "	else if (command === 'stop')" + "\n" +
    "" + "	{" + "\n" +
    "" + "		timerHandle = timerHandles[callbackID];" + "\n" +
    "" + "		if (timerHandle !== undefined && timerHandle !== null)" + "\n" +
    "" + "		{" + "\n" +
    "" + "			clearInterval(timerHandle);" + "\n" +
    "" + "		}" + "\n" +
    "" + "	}" + "\n" +
    "" + "};" + "\n" +
    "";
/**
 * @constructor
 */
var WebWorkerTimerFactory = function () {
    var workerBlob = new Blob([workerScript], { type: "text/javascript" });
    var workerURL = URL.createObjectURL(workerBlob);
    var worker = new Worker(workerURL);
    /** @type {Object.<number, function>} */
    var callbackMap = {};
    var nextCallbackID = 0;
    /**
     * @param {function} callback - the callback
     * @param {number} intervalTimeMillis - interval in milliseconds at which to call the callback
     * @return {Timer}
     */
    this.createTimer = function (callback, intervalTimeMillis) {
        var callbackID = nextCallbackID;
        callbackMap[callbackID] = callback;
        nextCallbackID++;
        worker.postMessage({ command: "start", callbackID: callbackID, callbackInterval: intervalTimeMillis });
        var timer = {};
        timer.stop = function () {
            callbackMap[callbackID] = null;
            worker.postMessage({ command: "stop", callbackID: callbackID });
        };
        return timer;
    };
    worker.onmessage = function (event) {
        var callbackID = event.data.callbackID;
        var callback = callbackMap[callbackID];
        if (callback) {
            callback();
        }
    };
};
/** @type {WebWorkerTimerFactory} */
var timerFactory = null;
/** @type boolean */
var workersAreAllowed = true;
var TimerTools = {};
/**
 * Creates a timer to repeatedly call the specified callback with the given time interval.
 * Call stop() on the returned object to cancel/stop the timer.
 * @param {function} callback - the callback
 * @param {number} intervalTimeMillis - interval in milliseconds at which to call the callback
 * @return {Timer}
 */
TimerTools.setInterval = function (callback, intervalTimeMillis) {
    if (intervalTimeMillis < 1000 && typeof (Worker) !== "undefined" && workersAreAllowed) {
        if (timerFactory === null) {
            try {
                timerFactory = new WebWorkerTimerFactory();
            }
            catch (error) {
                // workers aren't allowed, fail back to setInterval
                console.log("TimerTools: Worker blobs don't seem to be allowed, falling back to standard setInterval timing.");
                workersAreAllowed = false;
                return new BrowserTimer(callback, intervalTimeMillis);
            }
        }
        return timerFactory.createTimer(callback, intervalTimeMillis);
    }
    else {
        return new BrowserTimer(callback, intervalTimeMillis);
    }
};
/**
 * Stops the specified timer object.
 * @param {Timer} timer - the timer to stop
 */
TimerTools.clearInterval = function (timer) {
    if (timer) {
        timer.stop();
    }
};
TimerTools.WebWorkerTimerFactory = WebWorkerTimerFactory;
module.exports = TimerTools;

},{}],60:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
/**
 * @param {string} name
 * @param {THREE.Vector3} position
 * @param {THREE.Quaternion} orientation
 * @constructor
 */
var BasicFrame = function (name, position, orientation) {
    /** @type {string} */
    this.name = name || "";
    /** @type {THREE.Vector3} */
    this.position = position || new THREE.Vector3();
    /** @type {THREE.Quaternion} */
    this.orientation = orientation || new THREE.Quaternion();
};
/**
 * @param {object} jsonData
 * @return {BasicFrame}
 */
BasicFrame.prototype.setFromJson = function (jsonData) {
    this.name = jsonData.name;
    this.position.copy(BasicFrame.vector3FromJson(jsonData.xyzTranslation));
    this.orientation.copy(BasicFrame.quaternionFromJson(jsonData.wxyzRotation));
    return this;
};
/**
 * @return {THREE.Matrix4}
 */
BasicFrame.prototype.toMatrix4 = function () {
    return new THREE.Matrix4().compose(this.position, this.orientation, new THREE.Vector3(1, 1, 1));
};
/**
 * @param {Array} jsonArray
 * @return {THREE.Vector3}
 */
BasicFrame.vector3FromJson = function (jsonArray) {
    return new THREE.Vector3().fromArray(jsonArray);
};
/**
 * @param {Array} jsonArray
 * @return {THREE.Quaternion}
 */
BasicFrame.quaternionFromJson = function (jsonArray) {
    var wxyz = jsonArray;
    var q = new THREE.Quaternion(wxyz[1], wxyz[2], wxyz[3], wxyz[0]); // x, y, z, w
    q.inverse(); // switching from "world" frame convention (Apache/JSON) to "body" frame convention (THREE.js)
    return q;
};
module.exports = BasicFrame;

},{"@jibo/three":undefined}],61:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
/**
 * @constructor
 */
var BasicMesh = function () {
    /** @type {string} */
    this.name = null;
    /** @type {string} */
    this.skeletonFrameName = null;
    /** @type {THREE.Mesh} */
    this.mesh = null;
    /** @type {Array.<string>} */
    this.boneFrameNames = null;
    /** @type {Array.<THREE.Bone>} */
    this.bones = null;
};
module.exports = BasicMesh;

},{}],62:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
/**
 * @file Extra math functions/wrappers for THREE math access.
 */
"use strict";
var THREE = require("@jibo/three");
var ExtraMath = {};
ExtraMath.convertDirectionLocalToWorld = (function () {
    /** {THREE.Quaternion} */
    var worldQuaternion = null;
    /**
     * Wrapper for converting a direction Vector3 from local to a THREE Object3D to a world direction.
     *
     * @param {THREE.Object3D} frame - localDirection is in this frame
     * @param {THREE.Vector3} localDirection - local direction
     * @param {THREE.Vector3} inplaceResult - (may be null or omitted or the same instance as direction)
     */
    return function (frame, localDirection, inplaceResult) {
        if (worldQuaternion === null) {
            worldQuaternion = new THREE.Quaternion();
        }
        if (inplaceResult === undefined || inplaceResult === null) {
            inplaceResult = new THREE.Vector3();
        }
        frame.getWorldQuaternion(worldQuaternion);
        return inplaceResult.copy(localDirection).applyQuaternion(worldQuaternion);
    };
}());
/**
 * Find a Vector3 orthogonal to the given Vector3.
 *
 * @param {THREE.Vector3} direction
 * @param {THREE.Vector3} inplaceResult - (may be null or omitted or the same instance as direction)
 */
ExtraMath.findOrthogonal = function (direction, inplaceResult) {
    if (inplaceResult === undefined || inplaceResult === null) {
        inplaceResult = new THREE.Vector3();
    }
    var ax = Math.abs(direction.x);
    var ay = Math.abs(direction.y);
    var az = Math.abs(direction.z);
    //works as long as one of the two being swapped is non zero
    if (ax >= ay && ax >= az) {
        inplaceResult.set(direction.y, -direction.x, 0);
    }
    else {
        inplaceResult.set(0, direction.z, -direction.y);
    }
    return inplaceResult;
};
ExtraMath.quatFromAxisAngle = (function () {
    var normalizedAxis = null;
    /**
     * Axis/Angle quaternion construction wrapper that doesn't require axis to be normalized.
     *
     * @param {THREE.Vector3} axis - rotational axis, doesn't need to be normalized
     * @param {number} angle
     * @param {THREE.Quaternion} inplaceQuaternion - optional inplace quaternion to fill in
     * @returns {Quaternion}
     */
    return function (axis, angle, inplaceQuaternion) {
        if (normalizedAxis === null) {
            normalizedAxis = new THREE.Vector3();
        }
        if (inplaceQuaternion === null) {
            inplaceQuaternion = new THREE.Quaternion();
        }
        normalizedAxis.copy(axis).normalize();
        return inplaceQuaternion.setFromAxisAngle(normalizedAxis, angle);
    };
}());
ExtraMath.toString = function (vec3) {
    return vec3 != null ? ("(" + vec3.x + ", " + vec3.y + ", " + vec3.z + ")") : "null";
};
module.exports = ExtraMath;

},{"@jibo/three":undefined}],63:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelLoader = require("./ModelLoader");
var SkeletonLoader = require("./SkeletonLoader");
var THREE = require("@jibo/three");
/**
 * @constructor
 */
var ArticulatedModelLoadResult = function () {
    /** @type {string} */
    this.modelUrl = null;
    /** @type {string} */
    this.skeletonUrl = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {ModelLoadResult} */
    this.modelResult = null;
    /** @type {SkeletonLoadResult} */
    this.skeletonResult = null;
    /** @type {THREE.Object3D} */
    this.modelRoot = null;
};
/**
 * @param {ModelLoader} modelLoader
 * @param {SkeletonLoader} skeletonLoader
 * @constructor
 */
var ArticulatedModelLoader = function (modelLoader, skeletonLoader) {
    /** @type {ModelLoader} */
    this.modelLoader = modelLoader || new ModelLoader();
    /** @type {SkeletonLoader} */
    this.skeletonLoader = skeletonLoader || new SkeletonLoader();
    /** @type {ArticulatedModelLoadResult} */
    this._result = null;
};
/**
 * @return {ArticulatedModelLoadResult}
 */
ArticulatedModelLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} modelName
 * @param {!string} modelUrl - must not be null
 * @param {string} skeletonUrl - can be null
 * @param callback
 */
ArticulatedModelLoader.prototype.load = function (modelName, modelUrl, skeletonUrl, callback) {
    if (skeletonUrl) {
        var self = this;
        this.skeletonLoader.load(skeletonUrl, function () {
            var skeletonResult = self.skeletonLoader.getResult();
            if (skeletonResult.success) {
                self._loadModel(modelName, modelUrl, skeletonResult, callback);
            }
            else {
                var result = new ArticulatedModelLoadResult();
                result.modelUrl = modelUrl;
                result.skeletonUrl = skeletonUrl;
                result.skeletonResult = skeletonResult;
                result.success = false;
                result.message = "skeleton load failed with message: " + skeletonResult.message;
                self._result = result;
                callback();
            }
        });
    }
    else {
        this._loadModel(modelName, modelUrl, null, callback);
    }
};
/**
 * @param {string} modelName
 * @param {!string} modelUrl
 * @param {SkeletonLoadResult} skeletonResult
 * @param callback
 * @private
 */
ArticulatedModelLoader.prototype._loadModel = function (modelName, modelUrl, skeletonResult, callback) {
    var self = this;
    this.modelLoader.load(modelUrl, function () {
        self._result = new ArticulatedModelLoadResult();
        self._result.modelUrl = modelUrl;
        self._result.skeletonUrl = skeletonResult ? skeletonResult.url : null;
        self._result.skeletonResult = skeletonResult;
        var modelResult = self.modelLoader.getResult();
        self._result.modelResult = modelResult;
        if (!modelResult.success) {
            self._result.success = false;
            self._result.message = "model load failed with message: " + modelResult.message;
            callback();
            return;
        }
        var modelRoot = new THREE.Object3D();
        modelRoot.name = modelName || "";
        var i;
        if (!skeletonResult) {
            for (i = 0; i < modelResult.meshes.length; i++) {
                modelRoot.add(modelResult.meshes[i].mesh);
            }
        }
        else {
            var skeletonRoot = skeletonResult.skeletonRoot;
            modelRoot.add(skeletonRoot);
            for (i = 0; i < modelResult.meshes.length; i++) {
                var mesh = modelResult.meshes[i];
                if (mesh.bones) {
                    for (var b = 0; b < mesh.bones.length; b++) {
                        var boneParent = skeletonRoot.getObjectByName(mesh.boneFrameNames[b], true);
                        if (boneParent) {
                            boneParent.add(mesh.bones[b]);
                        }
                        else {
                            self._result.success = false;
                            self._result.message = "unable to find skeleton frame: " + mesh.boneFrameNames[b] + " required to attach bone " + b + " of mesh: " + mesh.name;
                            callback();
                            return;
                        }
                    }
                    mesh.mesh.material.skinning = true;
                    modelRoot.add(mesh.mesh);
                }
                else if (mesh.skeletonFrameName) {
                    var parent = skeletonRoot.getObjectByName(mesh.skeletonFrameName, true);
                    if (parent) {
                        parent.add(mesh.mesh);
                    }
                    else {
                        self._result.success = false;
                        self._result.message = "unable to find skeleton frame: " + mesh.skeletonFrameName + " required to attach mesh: " + mesh.name;
                        callback();
                        return;
                    }
                }
                else {
                    self._result.success = false;
                    self._result.message = "unable to attach mesh: " + mesh.name + " - no skeleton frame or skinning data specified";
                    callback();
                    return;
                }
            }
        }
        self._result.success = true;
        self._result.modelRoot = modelRoot;
        callback();
    });
};
module.exports = ArticulatedModelLoader;

},{"./ModelLoader":65,"./SkeletonLoader":66,"@jibo/three":undefined}],64:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
/**
 * @constructor
 */
var ImageLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {THREE.Object3D} */
    this.image = null;
};
/**
 * @constructor
 */
var CachedImageLoader = function () {
    /** @type {THREE.ImageLoader} */
    this._loader = new THREE.ImageLoader();
    /** @type {ImageLoadResult} */
    this._result = null;
};
/**
 * @return {ImageLoadResult}
 */
CachedImageLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
CachedImageLoader.prototype.loadImage = function (url, callback) {
    var self = this;
    this._loader.load(url, function (image) {
        // done
        var result = new ImageLoadResult();
        result.url = url;
        result.success = true;
        result.image = image;
        self._result = result;
        if (callback) {
            callback();
        }
    }, undefined, function (event) {
        // error
        var result = new ImageLoadResult();
        result.url = url;
        result.success = false;
        self._result = result;
        if (callback) {
            callback();
        }
    });
};
module.exports = CachedImageLoader;

},{"@jibo/three":undefined}],65:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var BasicMesh = require("../BasicMesh");
var BasicFrame = require("../BasicFrame");
var FileTools = require("../../ifr-core/FileTools");
var THREE = require("@jibo/three");
/**
 * @constructor
 */
var ModelLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {Array.<BasicMesh>} */
    this.meshes = null;
};
/**
 * @param {THREE.MeshPhongMaterial} defaultMaterial
 * @constructor
 */
var ModelLoader = function (defaultMaterial) {
    /** @type {THREE.MeshPhongMaterial} */
    this.defaultMaterial = defaultMaterial;
    if (!this.defaultMaterial) {
        this.defaultMaterial = new THREE.MeshPhongMaterial();
    }
    /** @type {string} */
    this.baseTextureURL = null;
    /** @type {ModelLoadResult} */
    this._result = null;
};
/**
 * @return {ModelLoadResult}
 */
ModelLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
ModelLoader.prototype.load = function (url, callback) {
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data, url);
            if (callback) {
                callback();
            }
        }
        else {
            var result = new ModelLoadResult();
            result.url = url;
            result.success = false;
            result.message = error;
            self._result = result;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @param {string} dataUrl
 */
ModelLoader.prototype.parseData = function (jsonData, dataUrl) {
    this._result = new ModelLoadResult();
    this._result.url = dataUrl;
    if (jsonData.header.fileType !== "Meshes") {
        this._result.success = false;
        this._result.message = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    var parentDir = dataUrl.substring(0, dataUrl.lastIndexOf('/') + 1);
    this._result.meshes = [];
    for (var meshIndex = 0; meshIndex < jsonData.content.meshes.length; meshIndex++) {
        var meshData = jsonData.content.meshes[meshIndex];
        var mesh = new BasicMesh();
        mesh.name = meshData.name;
        mesh.skeletonFrameName = meshData.skeletonFrameName;
        var geom = new THREE.BufferGeometry();
        var positionData = new Float32Array(meshData.position);
        geom.addAttribute("position", new THREE.BufferAttribute(positionData, 3));
        if (meshData.normal) {
            var normalData = new Float32Array(meshData.normal);
            geom.addAttribute("normal", new THREE.BufferAttribute(normalData, 3));
        }
        if (meshData.textureCoordinates) {
            var textureData = new Float32Array(meshData.textureCoordinates);
            geom.addAttribute("uv", new THREE.BufferAttribute(textureData, 2));
        }
        if (meshData.triangles) {
            var faceData = new Uint32Array(meshData.triangles);
            geom.addAttribute("index", new THREE.BufferAttribute(faceData, 3));
        }
        if (meshData.color) {
            var colorData = new Float32Array(meshData.color.length / 4 * 3);
            for (var i = 0; i < meshData.color.length / 4; i++) {
                colorData[i * 3] = meshData.color[i * 4];
                colorData[i * 3 + 1] = meshData.color[i * 4 + 1];
                colorData[i * 3 + 2] = meshData.color[i * 4 + 2];
            }
            geom.addAttribute("color", new THREE.BufferAttribute(colorData, 3));
        }
        /** @type {THREE.MeshPhongMaterial} */
        var meshMaterial = this.defaultMaterial.clone();
        meshMaterial.vertexColors = meshData.color ? THREE.VertexColors : THREE.NoColors;
        if (meshData.material) {
            var mat = meshData.material;
            if (mat.ambient) {
                meshMaterial.ambient = new THREE.Color(mat.ambient[0], mat.ambient[1], mat.ambient[2]);
            }
            if (mat.diffuse) {
                meshMaterial.color = new THREE.Color(mat.diffuse[0], mat.diffuse[1], mat.diffuse[2]);
            }
            if (mat.specular) {
                meshMaterial.specular = new THREE.Color(mat.specular[0], mat.specular[1], mat.specular[2]);
            }
            if (mat.emissive) {
                meshMaterial.emissive = new THREE.Color(mat.emissive[0], mat.emissive[1], mat.emissive[2]);
            }
            if (mat.shininess) {
                meshMaterial.shininess = mat.shininess;
            }
            if (mat.texture) {
                var textureURL = this.baseTextureURL ? this.baseTextureURL + mat.texture : parentDir + mat.texture;
                var texture = THREE.ImageUtils.loadTexture(textureURL);
                texture.minFilter = THREE.LinearFilter;
                meshMaterial.map = texture;
            }
        }
        if (!meshData.skin) {
            mesh.mesh = new THREE.Mesh(geom, meshMaterial);
            mesh.mesh.name = meshData.name;
        }
        else {
            mesh.mesh = new THREE.SkinnedMesh(geom, meshMaterial);
            mesh.mesh.name = meshData.name;
            var skinData = meshData.skin;
            mesh.boneFrameNames = skinData.skeletonTotalInfluences;
            var numBones = mesh.boneFrameNames.length;
            var bindFrame = new BasicFrame().setFromJson(skinData.skinBindFrame);
            var bindMatrix = bindFrame.toMatrix4();
            mesh.bones = [];
            var boneInverses = [];
            for (var b = 0; b < numBones; b++) {
                var boneFrame = new BasicFrame().setFromJson(skinData.skinBindInverses[b]);
                boneInverses.push(boneFrame.toMatrix4());
                var bone = new THREE.Bone(mesh.mesh);
                mesh.bones.push(bone);
            }
            var skeleton = new THREE.Skeleton(mesh.bones, boneInverses, false);
            mesh.mesh.bindMode = "detached";
            mesh.mesh.bind(skeleton, bindMatrix);
            var numVertices = positionData.length / 3;
            var skinWeights = new Float32Array(skinData.skeletonWeightsByVertex);
            var skinIndices = new Float32Array(skinData.skeletonInfluencesByVertex);
            if (skinWeights.length !== numVertices * 4) {
                this._result.success = false;
                this._result.message = "expected " + numVertices * 4 + " skeleton weights for mesh " + mesh.name + ", but got: " + skinWeights.length;
                return;
            }
            if (skinIndices.length !== numVertices * 4) {
                this._result.success = false;
                this._result.message = "expected " + numVertices * 4 + " skeleton influences for mesh " + mesh.name + ", but got: " + skinIndices.length;
                return;
            }
            geom.addAttribute("skinWeight", new THREE.BufferAttribute(skinWeights, 4));
            geom.addAttribute("skinIndex", new THREE.BufferAttribute(skinIndices, 4));
        }
        this._result.meshes.push(mesh);
    }
    this._result.success = true;
};
module.exports = ModelLoader;

},{"../../ifr-core/FileTools":54,"../BasicFrame":60,"../BasicMesh":61,"@jibo/three":undefined}],66:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var BasicFrame = require("../BasicFrame");
var FileTools = require("../../ifr-core/FileTools");
var THREE = require("@jibo/three");
/**
 * @constructor
 */
var SkeletonLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {THREE.Object3D} */
    this.skeletonRoot = null;
};
/**
 * @constructor
 */
var SkeletonLoader = function () {
    /** @type {SkeletonLoadResult} */
    this._result = null;
};
/**
 * @return {SkeletonLoadResult}
 */
SkeletonLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
SkeletonLoader.prototype.load = function (url, callback) {
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data, url);
            if (callback) {
                callback();
            }
        }
        else {
            var result = new SkeletonLoadResult();
            result.url = url;
            result.success = false;
            result.message = error;
            self._result = result;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @param {string} dataUrl
 */
SkeletonLoader.prototype.parseData = function (jsonData, dataUrl) {
    this._result = new SkeletonLoadResult();
    this._result.url = dataUrl;
    if (jsonData.header.fileType !== "Skeleton") {
        this._result.success = false;
        this._result.message = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    this._result.skeletonRoot = this._parseSkeleton(jsonData.content);
    this._result.success = true;
};
/**
 * @param {Object} jsonData
 * @return {THREE.Object3D}
 */
SkeletonLoader.prototype._parseSkeleton = function (jsonData) {
    var obj = new THREE.Object3D();
    var frame = new BasicFrame().setFromJson(jsonData);
    obj.name = frame.name;
    obj.position.copy(frame.position);
    obj.quaternion.copy(frame.orientation);
    if (jsonData.children) {
        for (var i = 0; i < jsonData.children.length; i++) {
            obj.add(this._parseSkeleton(jsonData.children[i]));
        }
    }
    return obj;
};
module.exports = SkeletonLoader;

},{"../../ifr-core/FileTools":54,"../BasicFrame":60,"@jibo/three":undefined}],67:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var channel = "ACCEL_PLANNER";
var AccelPlan = function (initialVelocity, targetVelocity, acceleration, accelerateTime, decelerateTime, totalTime, distance) {
    this._initialVelocity = initialVelocity;
    this._targetVelocity = targetVelocity;
    this._acceleration = acceleration;
    this._accelerateTime = accelerateTime;
    this._decelerateTime = decelerateTime;
    this._totalTime = totalTime;
    this._distance = distance;
};
AccelPlan.prototype.displacementAtTime = function (tDelta) {
    var newPosition = 0;
    if (tDelta > 0) {
        var useAccTime = Math.min(tDelta, this._accelerateTime);
        newPosition += (this._initialVelocity + (this._acceleration * useAccTime) / 2) * useAccTime;
        tDelta -= useAccTime;
    }
    if (tDelta > 0) {
        var useDecTime = Math.min(tDelta, this._decelerateTime);
        newPosition += (this._initialVelocity + (this._acceleration * this._accelerateTime) - (this._acceleration * useDecTime / 2)) * useDecTime;
        tDelta -= useDecTime;
    }
    if (tDelta > 0) {
        newPosition += this._targetVelocity * tDelta;
    }
    return newPosition;
};
AccelPlan.prototype.velocityAtTime = function (tDelta) {
    var newVelocity = this._initialVelocity;
    if (tDelta > 0) {
        var useAccTime = Math.min(tDelta, this._accelerateTime);
        newVelocity += this._acceleration * useAccTime;
        tDelta -= useAccTime;
    }
    if (tDelta > 0) {
        var useDecTime = Math.min(tDelta, this._decelerateTime);
        newVelocity -= this._acceleration * useDecTime;
        tDelta -= useDecTime;
    }
    return newVelocity;
};
AccelPlan.prototype.isConsistent = function () {
    if (isNaN(this._accelerateTime) || isNaN(this._decelerateTime)) {
        slog(channel, "Plan has NaN times! accelerationTime:" + this._accelerateTime + " decelerationTime:" + this._decelerateTime);
        return false;
    }
    if (!isFinite(this._accelerateTime) || !isFinite(this._decelerateTime)) {
        slog(channel, "Plan has non-finite times! accelerationTime:" + this._accelerateTime + " decelerationTime:" + this._decelerateTime);
        return false;
    }
    if (isNaN(this._acceleration)) {
        slog(channel, "Plan has NaN acceleration!: " + this._acceleration);
        return false;
    }
    if (!isFinite(this._acceleration)) {
        slog(channel, "Plan has non-finite acceleration!: " + this._acceleration);
        return false;
    }
    var totalTime = this._accelerateTime + this._decelerateTime;
    var targetDisplacement = this._distance + this._targetVelocity * totalTime;
    var ourDisplacement = (this._initialVelocity + (this._acceleration * this._accelerateTime) / 2) * this._accelerateTime +
        (this._initialVelocity + (this._acceleration * this._accelerateTime) - (this._acceleration * this._decelerateTime / 2)) * this._decelerateTime;
    var ourFinalV = this._initialVelocity + this._acceleration * this._accelerateTime - this._acceleration * this._decelerateTime;
    if (this._accelerateTime < 0 || this._decelerateTime < 0) {
        slog(channel, "Plan has negative times! accelerationTime:" + this._accelerateTime + " decelerationTime:" + this._decelerateTime);
        return false;
    }
    if (Math.abs(this._accelerateTime + this._decelerateTime - this._totalTime) > 0.0000001) {
        slog(channel, "Plan time segments are not equal to target time! segments:" + (this._accelerateTime + this._decelerateTime) + " target:" + this._totalTime);
        return false;
    }
    if (Math.abs(ourDisplacement - targetDisplacement) > 0.000001) {
        slog(channel, "Plan has incorrect integral! ourDisplacement:" + ourDisplacement + " pDelta:" + targetDisplacement);
        return false;
    }
    if (Math.abs(ourFinalV - this._targetVelocity) > 0.0000001) {
        slog(channel, "Plan has incorrect final velocity resultV:" + ourFinalV + " pDelta:" + this._targetVelocity);
        return false;
    }
    return true;
};
/**
 * @returns {number}
 */
AccelPlan.prototype.getTotalTime = function () {
    return this._totalTime;
};
var AccelPlanner = function () {
};
/**
 * Compute the acceleration needed to intercept a target moving at
 * vTarget and starting pDelta away from our initial velocity vCurrent
 * in time totalTime.  Acceleration is the free variable, time is fixed.
 *
 * @param {number} vCurrent
 * @param {number} vTarget
 * @param {number} pDelta
 * @param {number} totalTime
 * @returns {AccelPlan}
 */
AccelPlanner.prototype.computeWithFixedTime = function (vCurrent, vTarget, pDelta, totalTime) {
    //slog(channel, "Find (accel) plan for vTarget="+vTarget+" vCurrent="+vCurrent+" totalTime="+totalTime+" pDelta="+pDelta);
    if (totalTime < 0.0000000001) {
        slog(channel, "Asked for fixed time plan with time of " + totalTime + ", returning null");
        return null;
    }
    var aChoiceT1, aChoiceT2;
    var term1 = (((vTarget - vCurrent) * totalTime / 2) + pDelta);
    var tosqrt = Math.pow((vCurrent - vTarget) * totalTime / 2 - pDelta, 2) -
        Math.pow(totalTime, 2) * (vTarget * vCurrent / 2 - Math.pow(vCurrent, 2) / 4 - Math.pow(vTarget, 2) / 4);
    if (tosqrt < 0) {
        if (tosqrt > -0.0000000001) {
            //could occasionally, when values are very borderline, be slightly below zero here in an otherwise ok condition
            tosqrt = 0;
        }
        else {
            slog(channel, "Inconsistent CWFT Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", totalTime:" + totalTime + ", tsqrt:" + tosqrt);
            return null;
        }
    }
    var term2 = Math.sqrt(tosqrt);
    var term3 = Math.pow(totalTime, 2) / 2;
    var sign = 1;
    if (pDelta < 0.5 * totalTime * (vCurrent - vTarget)) {
        sign = -1;
    }
    var aChoice = (term1 + sign * term2) / term3;
    if (aChoice === 0) {
        aChoiceT1 = totalTime;
        aChoiceT2 = 0;
    }
    else if (Math.abs(aChoice) < 0.0000000001) {
        //if accel is so small, plan may be compromised numerically
        //also, plan can be approximated by doing nothing.
        aChoice = 0;
        aChoiceT1 = totalTime;
        aChoiceT2 = 0;
    }
    else {
        aChoiceT1 = totalTime / 2 + (vTarget - vCurrent) / (2 * aChoice);
        aChoiceT2 = totalTime / 2 + (vCurrent - vTarget) / (2 * aChoice);
    }
    if (aChoiceT1 < 0) {
        if (aChoiceT1 > -0.0000000001) {
            aChoiceT1 = 0;
        }
        else {
            slog(channel, "Inconsistent CWFTaT1 Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", totalTime:" + totalTime + ", aChoiceT1:" + aChoiceT1);
            return null;
        }
    }
    if (aChoiceT2 < 0) {
        if (aChoiceT2 > -0.0000000001) {
            aChoiceT2 = 0;
        }
        else {
            slog(channel, "Inconsistent CWFTaT2 Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", totalTime:" + totalTime + ", aChoiceT2:" + aChoiceT2);
            return null;
        }
    }
    var accelPlan = new AccelPlan(vCurrent, vTarget, aChoice, aChoiceT1, aChoiceT2, totalTime, pDelta);
    return accelPlan;
};
/**
 *
 * @param {number} vCurrent
 * @param {number} vTarget
 * @param {number} pDelta
 * @param {number} acceleration
 * @returns {AccelPlan}
 */
AccelPlanner.prototype.computeWithFixedAccel = function (vCurrent, vTarget, pDelta, acceleration) {
    //slog(channel, "Find (time) plan for vTarget="+vTarget+" vCurrent="+vCurrent+" acceleration="+acceleration+" pDelta="+pDelta);
    //var plans = [];
    //if we go positive first, the smallest distance we can travel
    //is to go straight to the target velocity
    // (zero t2 in +deltaV cases, zero t1 in -deltaV cases)
    // thus if we need less distance than this path, we need -a
    if (acceleration < 0.0000000001) {
        slog(channel, "Asked for fixed acceleration plan with acceleration of " + acceleration + ", returning null");
        return null;
    }
    var useAcceleration = acceleration;
    var useSign = 1;
    //var timeToReachTargetVelocity = Math.abs((vTarget - vCurrent)/acceleration);
    //var distanceTraveled = (vTarget + vCurrent)/2 * timeToReachTargetVelocity;
    //var needToCoverDistance = pDelta + vTarget * timeToReachTargetVelocity;
    //
    //if(distanceTraveled > needToCoverDistance){
    //	useAcceleration = -acceleration;
    //}
    //simplified
    if ((vCurrent - vTarget) * Math.abs(vTarget - vCurrent) / (2 * acceleration) > pDelta) {
        useAcceleration = -acceleration;
        useSign = -1;
    }
    var term1 = 2 * vTarget - 2 * vCurrent;
    var tosqrt = 2 * Math.pow(vCurrent - vTarget, 2) + 4 * useAcceleration * pDelta;
    if (tosqrt < 0) {
        if (tosqrt > -0.0000000001) {
            //can occasionally, when values are very borderline, be slightly below zero here in an otherwise ok condition
            //e.g., vCurrent = -0.3385816504064119, vTarget = 0, pDelta = -0.019106255665321623, acceleration = 3
            tosqrt = 0;
        }
        else {
            slog(channel, "Inconsistent CWFA Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", acceleration:" + acceleration + ", tsqrt:" + tosqrt);
            return null;
        }
    }
    var term2 = Math.sqrt(tosqrt);
    var term3 = 2 * useAcceleration;
    var time1Choice = (term1 + useSign * term2) / term3;
    var time2Choice = vCurrent / useAcceleration + time1Choice - vTarget / useAcceleration;
    if (time1Choice < 0) {
        if (time1Choice > -0.0000000001) {
            time1Choice = 0;
        }
        else {
            slog(channel, "Inconsistent CWFAt1 Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", acceleration:" + acceleration + ", t1Choice:" + time1Choice);
            return null;
        }
    }
    if (time2Choice < 0) {
        if (time2Choice > -0.0000000001) {
            time2Choice = 0;
        }
        else {
            slog(channel, "Inconsistent CWFAt2 Plan for vCurrent:" + vCurrent + ", vTarget:" + vTarget + ", pDelta:" + pDelta + ", acceleration:" + acceleration + ", t2Choice:" + time2Choice);
            return null;
        }
    }
    return new AccelPlan(vCurrent, vTarget, useAcceleration, time1Choice, time2Choice, (time1Choice + time2Choice), pDelta);
};
/**
 * Simple plan where we go at a constant speed for degenerate cases etc.
 * @param vCurrent speed to go at
 * @returns {AccelPlan} plan to go at constant speed with zero accel.  plan length is 1
 */
AccelPlanner.prototype.computeWithZeroAccel = function (vCurrent) {
    var accelPlan = new AccelPlan(vCurrent, vCurrent, 0, 1, 0, 1, 0);
    return accelPlan;
};
AccelPlanner.prototype.computeWithMaxAccel = function (vCurrent, vTarget, pDelta, maxAcceleration, targetInterceptTime) {
    if (maxAcceleration < 0.000001) {
        return this.computeWithZeroAccel(vCurrent);
    }
    var fixedTimePlan = this.computeWithFixedTime(vCurrent, vTarget, pDelta, targetInterceptTime);
    if (Math.abs(fixedTimePlan._acceleration) <= maxAcceleration) {
        return fixedTimePlan;
    }
    else {
        var fixedAccelPlan = this.computeWithFixedAccel(vCurrent, vTarget, pDelta, maxAcceleration);
        return fixedAccelPlan;
    }
};
/**
 * Create a trivial plan what will accelerate in the given direction forever.
 * This plan will not pass isConsistent, as it has no target, etc.
 *
 * @param {number} vInitial - start at this velocity
 * @param {number} accel - accelerate at this acceleration forever
 * @return {AccelPlan}
 */
AccelPlanner.prototype.createPlanWithFixedAccelForever = function (vInitial, accel) {
    return new AccelPlan(vInitial, NaN, accel, Infinity, 0, Infinity, Infinity);
};
module.exports = AccelPlanner;

},{"../../ifr-core/SLog":57}],68:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Motion = require("./Motion");
var MotionEvent = require("./MotionEvent");
/**
 * @param {Motion} motion
 * @param {MotionEvent[]} [events]
 * @constructor
 */
var AnnotatedMotion = function (motion, events) {
    var rep = {};
    rep.motion = motion;
    events = events || [];
    rep.events = events;
    /** @type {number} */
    rep.speed = 1;
    /**
     * @return {Motion}
     */
    this.getMotion = function () {
        return rep.motion;
    };
    /**
     * @return {number}
     */
    this.getEventCount = function () {
        return rep.events.length;
    };
    /**
     * @param {number} index
     * @return {MotionEvent}
     */
    this.getEvent = function (index) {
        return rep.events[index];
    };
    /**
     * @return {MotionEvent[]}
     */
    this.getEvents = function () {
        return rep.events;
    };
    /**
     * @return {number}
     */
    this.getSpeed = function () {
        return rep.speed;
    };
    /**
     * Set the speed of this motion relative to the source motion.
     * @param {number} speed - speed modifier (2 means twice as fast as the source motion)
     */
    this.setSpeed = function (speed) {
        if (speed <= 0) {
            throw new Error("invalid speed: " + speed);
        }
        if (speed !== rep.speed) {
            rep.speed = speed;
            if (rep.speed === 1) {
                rep.motion = motion;
                rep.events = events;
            }
            else {
                var newMotion = new Motion(motion.getName());
                var trackKeys = Object.keys(motion.getTracks());
                for (var tki = 0; tki < trackKeys.length; tki++) {
                    //duplicate each dof's track
                    var newTrack = motion.getTracks()[(trackKeys[tki])].clone();
                    //grab the timestamps array from TimestampedBuffer
                    var timestamps = newTrack.getMotionData().timestampList;
                    for (var si = 0; si < timestamps.length; si++) {
                        //modify each timestamp
                        timestamps[si] = timestamps[si] / speed;
                    }
                    //modify total length
                    newTrack.length = newTrack.length / speed;
                    newMotion.addTrack(newTrack);
                }
                rep.motion = newMotion;
                var newEvents = [];
                for (var evi = 0; evi < events.length; evi++) {
                    var newTimestamp = events[evi].getTimestamp() / speed;
                    var eventName = events[evi].getEventName();
                    var payload = events[evi].getPayload();
                    newEvents.push(new MotionEvent(newTimestamp, eventName, payload));
                }
                rep.events = newEvents;
            }
        }
    };
};
module.exports = AnnotatedMotion;

},{"./Motion":74,"./MotionEvent":75}],69:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var CyclicMath = require("./CyclicMath");
/**
 *
 * @param {string} dofName
 * @constructor
 */
var CyclicDOFTargetSelector = function (dofName) {
    this._dofName = dofName;
};
/**
 *
 * Compute value for our DOF, rotationally equivalent to the value it has
 * in targetPose, but that causes it to go the short (or the otherwise
 * preferable) way around from currentPose
 *
 * This may rely on the currentPose and targetPose values being the correct
 * sign, i.e., the ancestor values are going to be used as-is, not same-sided
 * after this point. (Except for the sign of our dof in targetPose pose, of
 * course, which is what we're computing)
 *
 * @param {Pose} currentPose - current pose (should include current position of theDOF)
 * @param {Pose} targetPose - target pose (should include target position of theDOF)
 * @abstract
 * @return {number} target for this DOF (from targetPose), made into the "close-path" equivalent value for theDOF
 */
CyclicDOFTargetSelector.prototype.closestEquivalentRotation = function (currentPose, targetPose) {
    return CyclicMath.closestEquivalentRotation(targetPose.get(this._dofName, 0), currentPose.get(this._dofName, 0));
};
/**
 * @return {string} name of the dof this selector is computing values for
 */
CyclicDOFTargetSelector.prototype.getDOFName = function () {
    return this._dofName;
};
module.exports = CyclicDOFTargetSelector;

},{"./CyclicMath":70}],70:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var CyclicMath = function () {
};
/**
 * Return the angle whose value is closest to "referenceAngle" and
 * with the same angular position as "angle"
 *
 * @param {number} angle
 * @param {number} referenceAngle
 */
CyclicMath.closestEquivalentRotation = function (angle, referenceAngle) {
    var delta = referenceAngle - angle;
    var addRevolutions = Math.floor((delta + Math.PI) / (Math.PI * 2));
    var converted = angle + addRevolutions * Math.PI * 2;
    return converted;
};
module.exports = CyclicMath;

},{}],71:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var CyclicDOFTargetSelector = require("./CyclicDOFTargetSelector");
/**
 * Collection of tools to help alignment of DOFs accounting
 * for their global-space (world space) positions.
 *
 * @param {KinematicGroup} kinematicGroup
 * @param {Object.<string,CyclicDOFTargetSelector>} [customGlobalSelectors]
 * @constructor
 */
var DOFGlobalAlignment = function (kinematicGroup, customGlobalSelectors) {
    var i;
    /** @type {Object.<string,CyclicDOFTargetSelector>} */
    var globalTargetSelectors = {};
    var localTargetSelectors = {};
    var dofNames = kinematicGroup.getDOFNames();
    //////////init ancestor sort ordering/////////////
    /** @type {Object.<string,number>} */
    var dofDepth = {};
    var dofDepthComparator = function (dofName1, dofName2) {
        var d1 = dofDepth[dofName1];
        var d2 = dofDepth[dofName2];
        if (d1 != null && d2 != null) {
            return d1 - d2;
        }
        else {
            return 0;
        }
    };
    for (i = 0; i < dofNames.length; i++) {
        var depth = 0;
        var control = kinematicGroup.getModelControlGroup().getControlForDOF(dofNames[i]);
        if (control != null) {
            if (control.getControlType() === "ROTATION" || control.getControlType() === "TRANSLATION") {
                var transformName = control.getTransformName();
                var transform = kinematicGroup.getTransform(transformName);
                if (transform != null) {
                    while (transform.parent != null) {
                        depth++;
                        transform = transform.parent;
                    }
                }
            }
        }
        dofDepth[dofNames[i]] = depth;
    }
    ///////////////////////////////////////////////////
    ///////////init target selectors///////////////
    for (i = 0; i < dofNames.length; i++) {
        var dofName = dofNames[i];
        if (kinematicGroup.getModelControlGroup().getDOFInfo(dofName).isCyclic()) {
            if (customGlobalSelectors && customGlobalSelectors.hasOwnProperty(dofName)) {
                globalTargetSelectors[dofName] = customGlobalSelectors[dofName];
            }
            else {
                globalTargetSelectors[dofName] = new CyclicDOFTargetSelector(dofName);
            }
            localTargetSelectors[dofName] = new CyclicDOFTargetSelector(dofName);
        }
    }
    ///////////////////////////////////////////////
    /**
     * Sort the provided list of dof names inplace by the order of the hierarchical location of
     * their corresponding transforms, from root to leaves.  Each node will precede
     * its children, and order amongst same-level nodes is arbitrary.  DOFs with no corresponding
     * transforms will be at the beginning of the list in an arbitrary order.
     *
     * @param {string[]} dofNames - inplace list of dofnames to be sorted
     * @return {string[]} the inplace dofNames list is sorted (modified) and also returned for convenience
     */
    this.sortDOFsByDepth = function (dofNames) {
        return dofNames.sort(dofDepthComparator);
    };
    /**
     * Get the target selector for this DOF.  May be the default CyclicDOFTargetSelector,
     * or a custom implementation for this joint that takes into account parent motion
     * to find a better preferred direction.
     *
     * @param {string} dofName
     * @returns {CyclicDOFTargetSelector}
     */
    this.getGlobalTargetSelector = function (dofName) {
        return globalTargetSelectors[dofName];
    };
    /**
     * Get the target selector for this DOF.
     *
     * @param {string} dofName
     * @returns {CyclicDOFTargetSelector}
     */
    this.getLocalTargetSelector = function (dofName) {
        return localTargetSelectors[dofName];
    };
    /**
     * Modifies toPose inplace to represent an equivalent orientation for each dof, but with the values
     * potentially modified to cyclically equivalent values to represent less global motion between
     * fromPose and toPose.
     *
     * @param {Pose} fromPose - starting position
     * @param {Pose} toPose - target position, will be modified to have the same orientation but less rotation
     * @param {string[]} [onDOFs] - computed for these dofs.  dofs from fomPose used if null or undefined
     */
    this.refineToGloballyClosestTargetPose = function (fromPose, toPose, onDOFs) {
        if (onDOFs == null) {
            onDOFs = fromPose.getDOFNames();
        }
        var sortedOnDOFs = this.sortDOFsByDepth(onDOFs.slice(0));
        for (var di = 0; di < sortedOnDOFs.length; di++) {
            var targetSelector = this.getGlobalTargetSelector(sortedOnDOFs[di]);
            if (targetSelector) {
                var t = targetSelector.closestEquivalentRotation(fromPose, toPose);
                toPose.set(sortedOnDOFs[di], t, 0); //update pose for children computation
            }
        }
    };
    /**
     * Modifies toPose inplace to represent an equivalent orientation for each dof, with the values
     * computed to have each DOF have the least local motion to get to target.
     *
     * @param {Pose} fromPose - starting position
     * @param {Pose} toPose - target position, will be modified to have the same orientation but less rotation
     * @param {string[]} [onDOFs] - computed for these dofs.  dofs from fomPose used if null or undefined
     */
    this.refineToLocallyClosestTargetPose = function (fromPose, toPose, onDOFs) {
        if (onDOFs == null) {
            onDOFs = fromPose.getDOFNames();
        }
        //don't need to sort for local computations
        for (var di = 0; di < onDOFs.length; di++) {
            var targetSelector = this.getLocalTargetSelector(onDOFs[di]);
            if (targetSelector) {
                var t = targetSelector.closestEquivalentRotation(fromPose, toPose);
                toPose.set(onDOFs[di], t, 0); //save result in inplace output
            }
        }
    };
};
module.exports = DOFGlobalAlignment;

},{"./CyclicDOFTargetSelector":69}],72:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Interpolators = require("./Interpolators");
var TextureControl = require("../dofs/TextureControl");
var VisibilityControl = require("../dofs/VisibilityControl");
/**
 * @constructor
 */
var InterpolatorSet = function () {
    /** @type {Object.<string, Interpolators.BaseInterpolator>} */
    this.interpolatorSet = {};
};
/**
 * associate an interpolator with a specified DOF
 * @param {string} dofName
 * @param {Interpolators.BaseInterpolator} interpolator
 */
InterpolatorSet.prototype.addInterpolator = function (dofName, interpolator) {
    this.interpolatorSet[dofName] = interpolator;
};
/**
 * get the interpolator associated with the specified DOF, or null if none is set
 * @param {string} dofName
 * @return {Interpolators.BaseInterpolator}
 */
InterpolatorSet.prototype.getInterpolator = function (dofName) {
    var interpolator = this.interpolatorSet[dofName];
    return (interpolator !== undefined) ? interpolator : null;
};
/**
 * add interpolators for all of the DOFs in the specified ModelControlGroup
 * @param {ModelControlGroup} modelControlGroup
 */
InterpolatorSet.prototype.addModelControlGroup = function (modelControlGroup) {
    var controlList = modelControlGroup.getControlList();
    for (var controlIndex = 0; controlIndex < controlList.length; controlIndex++) {
        var modelControl = controlList[controlIndex];
        var dofNames = modelControl.getDOFNames();
        for (var dofIndex = 0; dofIndex < dofNames.length; dofIndex++) {
            if (modelControl instanceof TextureControl || modelControl instanceof VisibilityControl) {
                this.addInterpolator(dofNames[dofIndex], new Interpolators.DOFSampleInterpolator(new Interpolators.StepInterpolator()));
            }
            else {
                this.addInterpolator(dofNames[dofIndex], new Interpolators.DOFSampleInterpolator(new Interpolators.LinearInterpolator()));
            }
        }
    }
};
module.exports = InterpolatorSet;

},{"../dofs/TextureControl":89,"../dofs/VisibilityControl":91,"./Interpolators":73}],73:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Interpolators = {};
/**
 * @constructor
 */
Interpolators.BaseInterpolator = function () {
};
/**
 * Interpolate between two samples based on interpolation factor alpha.
 * alpha === 0 : sampleA-only; alpha === 1 : sampleB-only
 * @param {*} sampleA
 * @param {*} sampleB
 * @param {number} alpha interpolation factor
 * @return {*}
 */
Interpolators.BaseInterpolator.prototype.interpolate = function (sampleA, sampleB, alpha) {
    return sampleA;
};
/**
 * @param {number} [alphaThreshold]
 * @constructor
 */
Interpolators.StepInterpolator = function (alphaThreshold) {
    Interpolators.BaseInterpolator.call(this);
    /** @type {number} */
    this.alphaThreshold = (alphaThreshold !== undefined) ? alphaThreshold : 1;
};
Interpolators.StepInterpolator.prototype = Object.create(Interpolators.BaseInterpolator.prototype);
Interpolators.StepInterpolator.prototype.constructor = Interpolators.StepInterpolator;
Interpolators.StepInterpolator.prototype.interpolate = function (sampleA, sampleB, alpha) {
    return (alpha < this.alphaThreshold) ? sampleA : sampleB;
};
/**
 * @constructor
 */
Interpolators.LinearInterpolator = function () {
    Interpolators.BaseInterpolator.call(this);
};
Interpolators.LinearInterpolator.prototype = Object.create(Interpolators.BaseInterpolator.prototype);
Interpolators.LinearInterpolator.prototype.constructor = Interpolators.LinearInterpolator;
/**
 * Linearly interpolate between two numerical samples based on interpolation factor alpha.
 * alpha === 0 : sampleA-only; alpha === 1 : sampleB-only
 * @param {number} sampleA
 * @param {number} sampleB
 * @param {number} alpha interpolation factor
 * @return {number}
 */
Interpolators.LinearInterpolator.prototype.interpolate = function (sampleA, sampleB, alpha) {
    return (1 - alpha) * sampleA + alpha * sampleB;
};
/**
 * @param {Interpolators.BaseInterpolator} positionInterpolator
 * @param {Interpolators.BaseInterpolator} [derivativeInterpolator]
 * @constructor
 */
Interpolators.DOFSampleInterpolator = function (positionInterpolator, derivativeInterpolator) {
    Interpolators.BaseInterpolator.call(this);
    /** @type {Interpolators.BaseInterpolator} */
    this.positionInterpolator = positionInterpolator;
    /** @type {Interpolators.BaseInterpolator} */
    this.derivativeInterpolator = (derivativeInterpolator !== undefined) ? derivativeInterpolator : new Interpolators.LinearInterpolator();
};
Interpolators.DOFSampleInterpolator.prototype = Object.create(Interpolators.BaseInterpolator.prototype);
Interpolators.DOFSampleInterpolator.prototype.constructor = Interpolators.DOFSampleInterpolator;
/**
 * Interpolate between two DOF samples based on interpolation factor alpha.
 * @param {Array|*} sampleA
 * @param {Array|*} sampleB
 * @param {number} alpha
 * @return {Array}
 */
Interpolators.DOFSampleInterpolator.prototype.interpolate = function (sampleA, sampleB, alpha) {
    if (!(sampleA instanceof Array)) {
        sampleA = [sampleA];
    }
    if (!(sampleB instanceof Array)) {
        sampleB = [sampleB];
    }
    var result = [];
    var derivativeLength = Math.min(sampleA.length, sampleB.length);
    for (var derivativeIndex = 0; derivativeIndex < derivativeLength; derivativeIndex++) {
        if (derivativeIndex === 0) {
            result.push(this.positionInterpolator.interpolate(sampleA[derivativeIndex], sampleB[derivativeIndex], alpha));
        }
        else {
            result.push(this.derivativeInterpolator.interpolate(sampleA[derivativeIndex], sampleB[derivativeIndex], alpha));
        }
    }
    return result;
};
module.exports = Interpolators;

},{}],74:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Pose = require("./Pose");
var MotionTrack = require("./MotionTrack");
var TimestampedBuffer = require("./TimestampedBuffer");
/**
 * @param {string} name
 * @constructor
 */
var Motion = function (name) {
    /** @type {string} */
    this.name = name;
    /** @type {number} */
    this.length = 0;
    /** @type {Object.<string, MotionTrack>} */
    this.tracks = {};
};
/**
 * @return {string}
 */
Motion.prototype.getName = function () {
    return this.name;
};
/**
 * @return {number} duration of the motion in seconds
 */
Motion.prototype.getDuration = function () {
    return this.length;
};
/**
 * @return {Object.<string, MotionTrack>}
 */
Motion.prototype.getTracks = function () {
    return this.tracks;
};
/**
 * add a track to this motion
 * @param {MotionTrack} track
 */
Motion.prototype.addTrack = function (track) {
    this.tracks[track.getName()] = track;
    if (track.getLength() > this.length) {
        this.length = track.getLength();
    }
};
/**
 * @return {string[]}
 */
Motion.prototype.getDOFs = function () {
    return Object.keys(this.tracks);
};
/**
 * @param {string} dofName
 * @return {boolean}
 */
Motion.prototype.hasDOF = function (dofName) {
    return this.tracks.hasOwnProperty(dofName);
};
/**
 * get data for the specified DOF at the specified time
 * @param {string} dofName
 * @param {number} time
 * @param {Interpolators.BaseInterpolator} interpolator
 * @return {number[]}
 */
Motion.prototype.getDOFDataAtTime = function (dofName, time, interpolator) {
    if (this.tracks.hasOwnProperty(dofName)) {
        return this.tracks[dofName].getDataAtTime(time, interpolator);
    }
    else {
        return null;
    }
};
/**
 * get pose data for this motion at the specified time
 * @param {number} time
 * @param {InterpolatorSet} interpolatorSet DOF interpolators to use
 * @param {Pose} [inplacePose] if specified, store the result in this pose
 * @return {Pose} the requested pose data (inplacePose if specified)
 */
Motion.prototype.getPoseAtTime = function (time, interpolatorSet, inplacePose) {
    if (inplacePose === undefined || inplacePose === null) {
        inplacePose = new Pose(this.getName() + " pose sample", Object.keys(this.tracks));
    }
    if (typeof time !== 'number') {
        throw new Error("getPoseAtTime expects time as a number value in seconds");
    }
    var dofNames = inplacePose.getDOFNames();
    for (var dofIndex = 0; dofIndex < dofNames.length; dofIndex++) {
        var dofName = dofNames[dofIndex];
        if (this.tracks.hasOwnProperty(dofName)) {
            var interpolator = interpolatorSet.getInterpolator(dofName);
            if (interpolator === null) {
                throw new Error("no interpolator provided for DOF name: " + dofName);
            }
            else {
                var sample = this.tracks[dofName].getDataAtTime(time, interpolator);
                if (sample !== null) {
                    inplacePose.set(dofName, sample);
                }
            }
        }
    }
    return inplacePose;
};
Motion.prototype.toString = function () {
    var s = "Motion " + this.getName() + " length:" + this.getDuration();
    var dofs = this.getDOFs();
    for (var i = 0; i < dofs.length; i++) {
        s += "\n\t" + this.tracks[dofs[i]].toString();
    }
    return s;
};
/**
 * Convenience constructor to make a static "Motion" from a single pose.
 * Motion will have 1 keyframe at zero, and duration of passed in duration value.
 * Motion will have the dofs onDOFs if provided, otherwise will have all the
 * dofs present in pose.
 *
 * @param {string} name
 * @param {Pose} pose
 * @param {number} duration
 * @param {string[]} [onDOFs] - use only these DOFs (Defaults to all dofs in pose)
 * @return {Motion}
 */
Motion.createFromPose = function (name, pose, duration, onDOFs) {
    var motion = new Motion(name);
    if (onDOFs == null) {
        onDOFs = pose.getDOFNames();
    }
    for (var i = 0; i < onDOFs.length; i++) {
        var dofName = onDOFs[i];
        var value = pose.get(dofName);
        var dataNew = new TimestampedBuffer();
        dataNew.append(0, value);
        motion.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return motion;
};
/**
 * Convenience constructor to make a "Motion" from a series of poses.
 * Motion will have a keyframe at each time in times, and duration of passed in duration value.
 * Motion will have the dofs onDOFs if provided, otherwise will have all the
 * dofs present in the first pose in poses.
 *
 * @param {string} name
 * @param {Pose[]} poses
 * @param {number[]} times
 * @param {number} duration
 * @param {string[]} [onDOFs] - use only these DOFs (Defaults to all dofs in pose)
 * @return {Motion}
 */
Motion.createFromPoses = function (name, poses, times, duration, onDOFs) {
    var motion = new Motion(name);
    if (onDOFs == null) {
        onDOFs = poses[0].getDOFNames();
    }
    for (var i = 0; i < onDOFs.length; i++) {
        var dofName = onDOFs[i];
        var dataNew = new TimestampedBuffer();
        for (var j = 0; j < times.length; j++) {
            var value = poses[j].get(dofName);
            dataNew.append(times[j], value);
        }
        motion.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return motion;
};
/**
 * Convenience constructor to make a static "Motion" from a single DOF values object.
 * Motion will have 1 keyframe at zero, and duration of passed in duration value.
 * Motion will have the dofs onDOFs if provided, otherwise will have all the
 * dofs present in the DOF values object.
 *
 * @param {string} name
 * @param {Object.<string, Object>} dofValues
 * @param {number} duration
 * @param {string[]} [onDOFs] - use only these DOFs (Defaults to all dofs in dofValues object)
 * @return {Motion}
 */
Motion.createFromDOFValues = function (name, dofValues, duration, onDOFs) {
    var motion = new Motion(name);
    if (onDOFs == null) {
        onDOFs = Object.keys(dofValues);
    }
    for (var i = 0; i < onDOFs.length; i++) {
        var dofName = onDOFs[i];
        var value = dofValues[dofName];
        var dataNew = new TimestampedBuffer();
        dataNew.append(0, value);
        motion.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return motion;
};
/**
 * Convenience constructor to make a "Motion" from a series of DOF values objects.
 * Motion will have a keyframe at each time in times, and duration of passed in duration value.
 * Motion will have the dofs onDOFs if provided, otherwise will have all the
 * dofs present in the first DOF values object in the list.
 *
 * @param {string} name
 * @param {Array.<Object.<string, Object>>} dofValuesList
 * @param {number[]} times
 * @param {number} duration
 * @param {string[]} [onDOFs] - use only these DOFs (Defaults to all dofs in the first DOF values object)
 * @return {Motion}
 */
Motion.createFromDOFValuesList = function (name, dofValuesList, times, duration, onDOFs) {
    var motion = new Motion(name);
    if (onDOFs == null) {
        onDOFs = Object.keys(dofValuesList[0]);
    }
    for (var i = 0; i < onDOFs.length; i++) {
        var dofName = onDOFs[i];
        var dataNew = new TimestampedBuffer();
        for (var j = 0; j < times.length; j++) {
            var value = dofValuesList[j][dofName];
            dataNew.append(times[j], value);
        }
        motion.addTrack(new MotionTrack(dofName, dataNew, duration));
    }
    return motion;
};
module.exports = Motion;

},{"./MotionTrack":77,"./Pose":78,"./TimestampedBuffer":81}],75:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @param {number} timestamp
 * @param {string} eventName
 * @param {*} payload
 * @constructor
 */
var MotionEvent = function (timestamp, eventName, payload) {
    /**
     * @return {number}
     */
    this.getTimestamp = function () { return timestamp; };
    /**
     * @return {string}
     */
    this.getEventName = function () { return eventName; };
    /**
     * @return {*}
     */
    this.getPayload = function () { return payload; };
};
module.exports = MotionEvent;

},{}],76:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
/**
 * @param {MotionEvent[]} motionEvents
 * @param {RelativeTimeClip} clip
 * @constructor
 */
var MotionEventIterator = function (motionEvents, clip) {
    motionEvents = motionEvents || [];
    var eventIndex = 0;
    var self = this;
    /**
     * Gets whether or not there is at least one event available for the given clip time.
     * @param {number} clipTime - clip time in seconds
     * @return {boolean}
     */
    this.hasNext = function (clipTime) {
        // skip events before the clip in-point
        while (eventIndex < motionEvents.length && motionEvents[eventIndex].getTimestamp() < clip.getInPoint()) {
            eventIndex++;
        }
        var sourceTime = clip.getSourceTime(clipTime);
        return (eventIndex < motionEvents.length && motionEvents[eventIndex].getTimestamp() <= sourceTime);
    };
    /**
     * Gets the next event for the given clip time, or null if there is no such event available.
     * @param {number} clipTime - clip time in seconds
     * @return {MotionEvent}
     */
    this.next = function (clipTime) {
        if (self.hasNext(clipTime)) {
            var event = motionEvents[eventIndex];
            eventIndex++;
            return event;
        }
        else {
            return null;
        }
    };
    /**
     * Resets the iterator back to the beginning of the event list.
     */
    this.reset = function () {
        eventIndex = 0;
    };
};
module.exports = MotionEventIterator;

},{}],77:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @param {string} name the name of the track (usually the name of the associated DOF/control)
 * @param {TimestampedBuffer} motionData motion data
 * @param {number} length length of motion in seconds
 * @constructor
 */
var MotionTrack = function (name, motionData, length) {
    /** @type {string} */
    this.name = name;
    /** @type {TimestampedBuffer} */
    this.motionData = motionData;
    /** @type {number} */
    this.length = length;
};
MotionTrack.prototype.clone = function () {
    return new MotionTrack(this.name, this.motionData.clone(), this.length);
};
/**
 * @return {string}
 */
MotionTrack.prototype.getName = function () {
    return this.name;
};
/**
 * @return {number}
 */
MotionTrack.prototype.getLength = function () {
    return this.length;
};
/**
 * @return {TimestampedBuffer}
 */
MotionTrack.prototype.getMotionData = function () {
    return this.motionData;
};
/**
 * @param {number} time
 * @param {Interpolators.BaseInterpolator} interpolator
 * @return {*}
 */
MotionTrack.prototype.getDataAtTime = function (time, interpolator) {
    if (this.motionData.size() === 0) {
        return null;
    }
    var leftIndex = this.motionData.getLeftIndexForTime(time);
    var rightIndex = leftIndex + 1;
    leftIndex = Math.max(leftIndex, 0);
    rightIndex = Math.min(rightIndex, this.motionData.size() - 1);
    var leftStamp = this.motionData.getTimestamp(leftIndex);
    var rightStamp = this.motionData.getTimestamp(rightIndex);
    var alpha;
    if (leftStamp === rightStamp) {
        alpha = 0;
    }
    else {
        alpha = (time - leftStamp) / (rightStamp - leftStamp);
    }
    var leftData = this.motionData.getData(leftIndex);
    var rightData = this.motionData.getData(rightIndex);
    return interpolator.interpolate(leftData, rightData, alpha);
};
MotionTrack.prototype.toString = function () {
    return "MotionTrack " + this.getName() + ", length=" + this.getLength() + ", Data:" + this.motionData.toString();
};
module.exports = MotionTrack;

},{}],78:[function(require,module,exports){
/**
 * A pose is a set of values indicating the position of one or more DOFs.  Pose objects
 * are used to store and transfer these values.  Each Pose object has a fixed set of entries
 * (DOF names) that it will store values for.  It is ok to transfer data between poses
 * that have different sets of entries; only the overlapping data is transferred.
 *
 * A lazy-init is provided for cases where it is inconvenient to know ahead of time the
 * set of desired dof names; the set of dof names will be taken from the first Pose object
 * copied into the local instance using setPose.
 *
 * @author mattb, jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @type {?Object.<string, number>}
 */
var namesToIndex = null;
/**
 * @type {?string[]}
 */
var indexToName = null;
/**
 * @type {?number}
 */
var globalNumDOFs = null;
var globalSetup = function (dofNames) {
    //console.log("Global setup of Pose with "+dofNames.toString());
    globalNumDOFs = dofNames.length;
    namesToIndex = {};
    indexToName = new Array(globalNumDOFs);
    for (var i = 0; i < globalNumDOFs; i++) {
        namesToIndex[dofNames[i]] = i;
        indexToName[i] = dofNames[i];
    }
};
var numericComparator = function (number1, number2) {
    return number1 - number2;
};
var setupDOFNamesFromNames = function (pose, dofNames) {
    var dofIndex, i;
    if (pose.dofNames !== null) {
        throw new Error("Cannot re-setup pose with new dofnames!");
    }
    if (namesToIndex === null) {
        throw new Error("Pose used before __globalSetup!");
    }
    //pose.dofNames = dofNames;
    var numDOFsThisPose = dofNames.length;
    pose.dofIndices = new Array(numDOFsThisPose);
    pose.dofPresent = new Array(globalNumDOFs);
    pose.dofVals = new Array(globalNumDOFs);
    for (dofIndex = 0; dofIndex < globalNumDOFs; dofIndex++) {
        pose.dofPresent[dofIndex] = false;
    }
    for (i = 0; i < numDOFsThisPose; i++) {
        dofIndex = namesToIndex[dofNames[i]];
        if (typeof dofIndex === "undefined") {
            throw new Error("Cannot use DOF " + dofNames[i] + ", not in dofset!");
        }
        pose.dofIndices[i] = dofIndex;
        pose.dofPresent[dofIndex] = true;
        pose.dofVals[dofIndex] = [];
    }
    pose.dofIndices.sort(numericComparator);
    pose.dofNames = new Array(numDOFsThisPose);
    for (i = 0; i < numDOFsThisPose; i++) {
        pose.dofNames[i] = indexToName[pose.dofIndices[i]];
    }
    //now we have:
    //Arrays of globalNumDOF length, indexed by global indices:
    //  dofPresent, dofVals
    //Arrays of length dofNames.length (the dofs we have present), indexed in ascending order
    //by their entries in the global dofs index table:
    //  dofNames, dofIndices
};
/**
 * @param {string} name the name of this pose
 * @param {Array.<string>} [dofNames=null] array of DOF names that this pose will store values for (use null for lazy-init via setPose)
 * @constructor
 */
var Pose = function (name, dofNames) {
    /** @type {string} */
    this.name = name;
    /** @type {Array.<string>} */
    this.dofNames = null;
    /** @type {Array.<number>} */
    this.dofIndices = null;
    /** @type {Array.<boolean>} */
    this.dofPresent = null;
    /** @type {Object.<number, Array>} */
    this.dofVals = null;
    if ((dofNames !== undefined)) {
        setupDOFNamesFromNames(this, dofNames);
    }
};
/**
 * Set all entries in this Pose to the values contained in the specified pose.  DOF entries in
 * this pose not contained in the specified pose are left as is.
 *
 * If this pose was constructed with a null array of DOF names (lazy-init), then the first time this function is
 * called the local set of entries will be copied fully from the specified pose; subsequent calls
 * will behave as normal with this set of entries/DOF names.
 *
 * @param {Pose} pose pose to copy values from into this instance
 */
Pose.prototype.setPose = function (pose) {
    if (this.dofNames === null) {
        setupDOFNamesFromNames(this, pose.dofNames);
    }
    for (var i = 0; i < this.dofIndices.length; i++) {
        var dofIndex = this.dofIndices[i];
        if (pose.dofPresent[dofIndex]) {
            var v = pose.dofVals[dofIndex];
            var myV = this.dofVals[dofIndex];
            for (var j = 0; j < v.length; j++) {
                myV[j] = v[j];
            }
            myV.length = v.length;
        }
    }
};
/**
 * Set all 0th position entries in this Pose to the values contained in the specified pose.  DOF entries in
 * this pose not contained in the specified pose are left as is.
 *
 * If an element in this pose has 1+ slot data but the incoming pose has no data at all for that dof,
 * this pose will get a null in the 0th slot to preserve the 1+ slots.
 *
 * @param {Pose} pose - pose to copy values from into this instance
 */
Pose.prototype.setPose0Only = function (pose) {
    for (var i = 0; i < this.dofIndices.length; i++) {
        var dofIndex = this.dofIndices[i];
        if (pose.dofPresent[dofIndex]) {
            var v = pose.dofVals[dofIndex];
            var myV = this.dofVals[dofIndex];
            if (v.length > 0) {
                myV[0] = v[0];
            }
            else if (myV.length > 1) {
                myV[0] = null;
            }
            else {
                myV.length = 0;
            }
        }
    }
};
/**
 * @param {Pose} inplacePose pose to copy this instance's values into
 */
Pose.prototype.getPose = function (inplacePose) {
    inplacePose.setPose(this);
};
/**
 * Set the entry for the specified DOF name to the specified value.  If the specified DOF name
 * is not an element of this pose, this call has no effect.
 *
 * If derivativeIndex is specified, value is interpreted as a specific element in the DOF's
 * position-derivative array.  If derivativeIndex is left undefined, value must specify the
 * DOF's full position-derivative array.
 *
 * @param {string} dofName name of the DOF entry to set
 * @param {Array|*} value DOF value to set: either the full position-derivative array, or (if derivativeIndex is specified) a single element in the position-derivative array
 * @param {number} [derivativeIndex] derivative index of the specified value (e.g. 0 for position, 1 for first derivative, 2 for second derivative, etc.)
 */
Pose.prototype.set = function (dofName, value, derivativeIndex) {
    var dofIndex = namesToIndex[dofName];
    if (this.dofPresent[dofIndex]) {
        if (derivativeIndex !== undefined) {
            this.dofVals[dofIndex][derivativeIndex] = value;
        }
        else {
            this.dofVals[dofIndex] = value;
        }
    }
};
/**
 * Set the entry for the specified DOF to the specified value.  If the specified DOF
 * is not an element of this pose, this call has no effect.
 *
 * If derivativeIndex is specified, value is interpreted as a specific element in the DOF's
 * position-derivative array.  If derivativeIndex is left undefined, value must specify the
 * DOF's full position-derivative array.
 *
 * @param {number} dofIndex name of the DOF entry to set
 * @param {Array|*} value DOF value to set: either the full position-derivative array, or (if derivativeIndex is specified) a single element in the position-derivative array
 * @param {number} [derivativeIndex] derivative index of the specified value (e.g. 0 for position, 1 for first derivative, 2 for second derivative, etc.)
 */
Pose.prototype.setByIndex = function (dofIndex, value, derivativeIndex) {
    if (this.dofPresent[dofIndex]) {
        if (derivativeIndex !== undefined) {
            this.dofVals[dofIndex][derivativeIndex] = value;
        }
        else {
            this.dofVals[dofIndex] = value;
        }
    }
};
/**
 * Get the value for the specified DOF.  If the specified DOF is not an
 * element of this pose, null is returned.
 *
 * If derivativeIndex is specified, this call will return the specified element of the DOF's
 * position-derivative array, or null if no such element exists.
 *
 * @param {string} dofName name of the DOF value to get
 * @param {number} [derivativeIndex] derivative index to get (e.g. 0 for position, 1 for first derivative, 2 for second derivative, etc.)
 * @return {Array|*} the requested DOF value, or null if not present
 */
Pose.prototype.get = function (dofName, derivativeIndex) {
    var dofIndex = namesToIndex[dofName];
    if (this.dofPresent[dofIndex]) {
        var dofVal = this.dofVals[dofIndex];
        if (derivativeIndex !== undefined) {
            if (derivativeIndex >= dofVal.length) {
                return null;
            }
            else {
                return dofVal[derivativeIndex];
            }
        }
        else {
            return dofVal;
        }
    }
    else {
        return null;
    }
};
/**
 * Get the value for the specified DOF.  If the specified DOF is not an
 * element of this pose, null is returned.
 *
 * If derivativeIndex is specified, this call will return the specified element of the DOF's
 * position-derivative array, or null if no such element exists.
 *
 * @param {number} dofIndex global index of the dof to get
 * @param {number} [derivativeIndex] derivative index to get (e.g. 0 for position, 1 for first derivative, 2 for second derivative, etc.)
 * @return {Array|*} the requested DOF value, or null if not present
 */
Pose.prototype.getByIndex = function (dofIndex, derivativeIndex) {
    if (this.dofPresent[dofIndex]) {
        var dofVal = this.dofVals[dofIndex];
        if (derivativeIndex !== undefined) {
            if (derivativeIndex >= dofVal.length) {
                return null;
            }
            else {
                return dofVal[derivativeIndex];
            }
        }
        else {
            return dofVal;
        }
    }
    else {
        return null;
    }
};
/**
 * True if this pose includes the dof represented by dofIndex.  Not this does not
 * necessarily mean the pose has a value for this dof currently
 *
 * @param {number} dofIndex
 * @returns {boolean}
 */
Pose.prototype.hasDOFIndex = function (dofIndex) {
    return this.dofPresent[dofIndex];
};
/**
 * True if this pose includes the dof represented by dofIndex, and has a value
 * in the derivative index specified
 *
 * @param {number} dofIndex
 * @param {number} derivativeIndex
 * @returns {boolean}
 */
Pose.prototype.hasValueForDOFIndex = function (dofIndex, derivativeIndex) {
    return this.dofPresent[dofIndex] && this.dofVals[dofIndex].length > derivativeIndex;
};
/**
 * @return {string} the name of this pose
 */
Pose.prototype.getName = function () {
    return this.name;
};
/**
 * @return {Array.<string>} the array of DOF names that this pose stores values for
 */
Pose.prototype.getDOFNames = function () {
    return this.dofNames;
};
/**
 * @return {Array.<number>} the array of DOF indices that this pose stores values for
 */
Pose.prototype.getDOFIndices = function () {
    return this.dofIndices;
};
/**
 * clear the DOF values stored in this pose
 */
Pose.prototype.clear = function () {
    if (this.dofNames !== null) {
        for (var i = 0; i < this.dofIndices.length; i++) {
            this.dofVals[this.dofIndices[i]].length = 0;
        }
    }
};
/**
 * Get a copy of this pose that does not share any reps.
 *
 * @param {string} [name] - optional, will use original name if omitted
 * @return {Pose}
 */
Pose.prototype.getCopy = function (name) {
    var p = new Pose(name != null ? name : this.name); //null or undefined (eqnull)
    var originalDOFNames = this.dofNames;
    var originalDOFIndices = this.dofIndices;
    var originalDOFPresent = this.dofPresent;
    var numDOFs = originalDOFNames.length;
    var copiedDOFNames = new Array(numDOFs);
    var copiedDOFIndices = new Array(numDOFs);
    var copiedDOFPresent = new Array(globalNumDOFs);
    for (var i = 0; i < numDOFs; i++) {
        copiedDOFNames[i] = originalDOFNames[i];
        copiedDOFIndices[i] = originalDOFIndices[i];
    }
    for (var k = 0; k < globalNumDOFs; k++) {
        copiedDOFPresent[k] = originalDOFPresent[k];
    }
    p.dofNames = copiedDOFNames;
    p.dofIndices = copiedDOFIndices;
    p.dofPresent = copiedDOFPresent;
    p.dofVals = new Array(numDOFs);
    for (var ii = 0; ii < numDOFs; ii++) {
        var dofIndex = originalDOFIndices[ii];
        var origVal = this.dofVals[dofIndex];
        var newVal = new Array(origVal.length);
        for (var j = 0; j < origVal.length; j++) {
            newVal[j] = origVal[j];
        }
        p.dofVals[dofIndex] = newVal;
    }
    return p;
};
/**
 * Returns true if the other Pose represents the same dof subset and it has the same
 * values for those dofs.  Assumes both are already set up with a dofset.
 *
 * @param {Pose} otherPose
 * @return {boolean}
 */
Pose.prototype.equals = function (otherPose) {
    var i, j;
    if (this.dofIndices.length === otherPose.dofIndices.length) {
        for (i = 0; i < this.dofIndices.length; i++) {
            if (this.dofIndices[i] === otherPose.dofIndices[i]) {
                var globalIndex = this.dofIndices[i];
                var myDV = this.dofVals[globalIndex];
                var otherDV = otherPose.dofVals[globalIndex];
                if (myDV.length === otherDV.length) {
                    for (j = 0; j < myDV.length; j++) {
                        if (myDV[j] !== otherDV[j]) {
                            return false;
                        }
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    else {
        return false;
    }
    return true;
};
/**
 * Returns true if the other Pose represents the same dof subset and it has the same
 * values for the 0th slot for represented dofs.  Assumes both are already set up with a dofset.
 *
 * @param {Pose} otherPose
 * @return {boolean}
 */
Pose.prototype.equals0Only = function (otherPose) {
    var i;
    if (this.dofIndices.length === otherPose.dofIndices.length) {
        for (i = 0; i < this.dofIndices.length; i++) {
            if (this.dofIndices[i] === otherPose.dofIndices[i]) {
                var globalIndex = this.dofIndices[i];
                var myDV = this.dofVals[globalIndex];
                var otherDV = otherPose.dofVals[globalIndex];
                if (myDV.length > 0 && otherDV.length > 0) {
                    if (myDV[0] !== otherDV[0]) {
                        return false;
                    }
                }
                else if (myDV.length !== otherDV.length) {
                    return false;
                } //final case: both don't have a value, OK
            }
            else {
                return false;
            }
        }
    }
    else {
        return false;
    }
    return true;
};
/**
 * Returns true if the other Pose contains no information that would change this Pose if
 * it was passed in with setPose.  That is, any overlapping dofs have the same values as
 * this Pose.
 *
 * @param {Pose} otherPose
 * @return {boolean}
 */
Pose.prototype.equalsNoChange = function (otherPose) {
    var i, j;
    for (i = 0; i < this.dofIndices.length; i++) {
        var globalIndex = this.dofIndices[i];
        if (otherPose.dofPresent[globalIndex]) {
            var myDV = this.dofVals[globalIndex];
            var otherDV = otherPose.dofVals[globalIndex];
            if (myDV.length === otherDV.length) {
                for (j = 0; j < otherDV.length; j++) {
                    if (myDV[j] !== otherDV[j]) {
                        return false;
                    }
                }
            }
            else {
                return false; //otherPose has different number of values for this dof, no chance they won't change us
            }
        } //else, otherPose doesn't have this dof, it can't change us, continue
    }
    return true;
};
/**
 * Returns true if the other Pose contains no information that would change the 0th slot values
 * of this Pose if it was passed in with setPose.  That is, any overlapping dofs have the same 0th slot values
 * as this Pose.
 *
 * @param {Pose} otherPose
 * @return {boolean}
 */
Pose.prototype.equalsNoChange0Only = function (otherPose) {
    var i;
    for (i = 0; i < this.dofIndices.length; i++) {
        var globalIndex = this.dofIndices[i];
        if (otherPose.dofPresent[globalIndex]) {
            var myDV = this.dofVals[globalIndex];
            var otherDV = otherPose.dofVals[globalIndex];
            if (myDV.length > 0 && otherDV.length > 0) {
                if (myDV[0] !== otherDV[0]) {
                    return false;
                }
            }
            else if (myDV.length !== otherDV.length) {
                return false;
            }
        } //else, otherPose doesn't have this dof, it can't change us, continue
    }
    return true;
};
/**
 * Get the map used by Pose to go from dof names to Pose internal indices.  Use these
 * indices for getByIndex/setByIndex.  Returned value will be a copy of the map.
 * @return {Object.<string,number>}
 */
Pose.prototype.getDOFNamesToIndices = function () {
    return Object.assign({}, namesToIndex);
};
/**
 * Get the array mapping from Pose internal indices to dof names.  Use these indices
 * for getByIndex/setByIndex.  Returned value will be a copy of this array.
 * @returns {Array.<string>}
 */
Pose.prototype.getDOFIndicesToNames = function () {
    return indexToName.slice();
};
/**
 * Get the Pose internal index for the provided dof name.  Use these indices
 * for getByIndex/setByIndex
 * @param {string} dofName
 * @returns {number}
 */
Pose.prototype.getDOFIndexForName = function (dofName) {
    return namesToIndex[dofName];
};
/**
 * Get the name for the provided Pose internal index.  Use these indices
 * for getByIndex/setByIndex
 * @param {number} dofIndex
 * @returns {string}
 */
Pose.prototype.getDOFNameForIndex = function (dofIndex) {
    return indexToName[dofIndex];
};
/**
 * Operator for computeBinary.  Will only be called on non-null arguments
 * (e.g., both poses contain the dof.).  They could have zero elements however.
 *
 * @callback binaryOperator
 * @param {string} dofName
 * @param {number[]} pose1Data
 * @param {number[]} pose2Data
 * @return {number[]}
 * @intdocs
 */
/**
 * Only the values present in both a, b, and inplaceResult
 * will be computed and stored in inplaceResult.  If clearUnused is true,
 * then values in inplaceResult but not in a AND b will be cleared.
 * If inplaceResult is null or omitted, it will be created and will have
 * values present in a AND b.  Any or all arguments can point to the same Pose.
 *
 * @param {Pose} a
 * @param {Pose} b
 * @param {binaryOperator} operator
 * @param {boolean} [clearUnused=false] - clear elements in result not in (a AND b), otherwise leave them as is.
 * @param {Pose} [result=null]
 */
Pose.computeBinary = function (a, b, operator, clearUnused, result) {
    var i, dofIndex;
    if (result == null || result.dofNames == null) {
        //we'll go here if result is "blank" (no dof names set yet) or not provided.
        if (result == null) {
            result = new Pose(a.getName() + " x " + b.getName());
        }
        var intersectingDofNames = [];
        for (dofIndex = 0; dofIndex < globalNumDOFs; dofIndex++) {
            if (a.dofPresent[dofIndex] && b.dofPresent[dofIndex]) {
                intersectingDofNames.push(indexToName[dofIndex]);
            }
        }
        setupDOFNamesFromNames(result, intersectingDofNames);
    }
    for (i = 0; i < result.dofIndices.length; i++) {
        dofIndex = result.dofIndices[i];
        if (a.dofPresent[dofIndex] && b.dofPresent[dofIndex]) {
            result.dofVals[dofIndex] = operator(result.dofNames[i], a.dofVals[dofIndex], b.dofVals[dofIndex]);
        }
        else if (clearUnused) {
            result.dofVals[dofIndex].length = 0;
        }
    }
    return result;
};
/**
 * Operator for computeUnary.  Will only be called on non-null arguments
 * (e.g., pose contains the dof.).  It may have zero elements however.
 *
 * @callback unaryOperator
 * @param {string} dofName
 * @param {number[]} poseData
 * @return {number[]}
 * @intdocs
 */
/**
 * Only the values present in a and inplaceResult
 * will be computed and stored in inplaceResult.  If clearUnused is true,
 * then values in inplaceResult but not in a will be cleared.
 * If inplaceResult is null or omitted, it will be created and will have
 * values present in a.  Any or all arguments can point to the same Pose.
 *
 * @param {Pose} a
 * @param {unaryOperator} operator
 * @param {boolean} [clearUnused=false] - clear elements in result not in a, otherwise leave them as is.
 * @param {Pose} [result=null]
 */
Pose.computeUnary = function (a, operator, clearUnused, result) {
    var i, dofIndex;
    if (result == null || result.dofNames == null) {
        //we'll go here if result is "blank" (no dof names set yet) or not provided.
        if (result == null) {
            result = new Pose(a.getName(), a.dofNames);
        }
        else {
            setupDOFNamesFromNames(result, a.dofNames);
        }
    }
    for (i = 0; i < result.dofIndices.length; i++) {
        dofIndex = result.dofIndices[i];
        if (a.dofPresent[dofIndex]) {
            result.dofVals[dofIndex] = operator(result.dofNames[i], a.dofVals[dofIndex]);
        }
        else if (clearUnused) {
            result.dofVals[dofIndex].length = 0;
        }
    }
    return result;
};
/**
 *
 * @param {string} dofName
 * @param {number[]} pose1Data
 * @param {number[]} pose2Data
 * @return {number[]}
 * @private
 */
Pose._subtractOperator = function (dofName, pose1Data, pose2Data) {
    var result = [];
    var p10 = pose1Data.length > 0 ? pose1Data[0] : 0;
    var p20 = pose2Data.length > 0 ? pose2Data[0] : 0;
    result[0] = p10 - p20; //do at least the first (position), even if it's not explicitly present, will be treated as zero.
    var i = 1;
    while (i < pose1Data.length && i < pose2Data.length) {
        result.push(pose1Data[i] - pose2Data[i]);
        i++;
    }
    return result;
};
/**
 *
 * @param {string} dofName
 * @param {number[]} pose1Data
 * @param {number[]} pose2Data
 * @return {number[]}
 * @private
 */
Pose._additionOperator = function (dofName, pose1Data, pose2Data) {
    var result = [];
    var p10 = pose1Data.length > 0 ? pose1Data[0] : 0;
    var p20 = pose2Data.length > 0 ? pose2Data[0] : 0;
    result[0] = p10 + p20; //do at least the first (position), even if it's not explicitly present, will be treated as zero.
    var i = 1;
    while (i < pose1Data.length && i < pose2Data.length) {
        result.push(pose1Data[i] + pose2Data[i]);
        i++;
    }
    return result;
};
/**
 * Compute the advance of dofs in poseData by their velocities, optionally by the time specified (can be negative).
 * Dofs with no velocity are not advanced.  derivative data passed through to result unchanged.
 *
 * @param {string} dofName
 * @param {number[]} poseData
 * @param {number} [time=1]
 * @return {number[]}
 * @private
 */
Pose._advanceByVelocityOperator = function (dofName, poseData, time) {
    var result = [];
    if (poseData.length > 0) {
        if (time == null) {
            time = 1;
        }
        var velocity = 0;
        if (poseData.length >= 2) {
            velocity = poseData[1];
        }
        result[0] = (velocity * time + poseData[0]);
        for (var i = 1; i < poseData.length; i++) {
            result.push(poseData[i]);
        }
    }
    return result;
};
/**
 * Only the values present in both a, b, and inplaceResult
 * will be subtracted and stored in inplaceResult.  If clearUnused is true,
 * then values in inplaceResult but not in a AND b will be cleared.
 * If inplaceResult is null or omitted, it will be created and will have
 * values present in a AND b.  Any or all arguments can point to the same Pose.
 *
 * Derivatives will be subtracted if both are present for a dof.  Positions will
 * always be subtracted for dofs in all poses.
 *
 * @param {Pose} a
 * @param {Pose} b
 * @param {boolean} [clearUnused=false] - clear elements in result not in (a AND b), otherwise leave them as is.
 * @param {Pose} [result=null]
 */
Pose.subtract = function (a, b, clearUnused, result) {
    return Pose.computeBinary(a, b, Pose._subtractOperator, clearUnused, result);
};
/**
 * Only the values present in both a, b, and inplaceResult
 * will be added and stored in inplaceResult.  If clearUnused is true,
 * then values in inplaceResult but not in a AND b will be cleared.
 * If inplaceResult is null or omitted, it will be created and will have
 * values present in a AND b.  Any or all arguments can point to the same Pose.
 *
 * Derivatives will be added if both are present for a dof.  Positions will
 * always be added for dofs in all poses.
 *
 * @param {Pose} a
 * @param {Pose} b
 * @param {boolean} [clearUnused=false] - clear elements in result not in (a AND b), otherwise leave them as is.
 * @param {Pose} [result=null]
 */
Pose.add = function (a, b, clearUnused, result) {
    return Pose.computeBinary(a, b, Pose._additionOperator, clearUnused, result);
};
/**
 * Only the values present in a and inplaceResult
 * will be advanced and stored in inplaceResult.  If clearUnused is true,
 * then values in inplaceResult but not in a will be cleared.
 * If inplaceResult is null or omitted, it will be created and will have
 * values present in a.  Any or all arguments can point to the same Pose.
 * Empty velocities are assumed to be zero.
 *
 * @param a - pose to advance
 * @param clearUnused - clear elements in result not used in a
 * @param result - resulting advanced pose
 * @param [time=null] - if omitted or null, default (1) will be used
 */
Pose.advanceByTime = function (a, clearUnused, result, time) {
    if (time == null) {
        return Pose.computeUnary(a, Pose._advanceByVelocityOperator, clearUnused, result);
    }
    else {
        return Pose.computeUnary(a, function (dofName, poseData) {
            return Pose._advanceByVelocityOperator(dofName, poseData, time);
        }, clearUnused, result);
    }
};
Pose.prototype.toString = function () {
    var s = "Pose{";
    for (var i = 0; i < this.dofNames.length; i++) {
        s += this.dofNames[i] + ":[" + this.dofVals[this.dofIndices[i]].toString() + "]";
        if (i < this.dofNames.length - 1) {
            s += ",";
        }
    }
    return s + "}";
};
Pose.__globalSetup = globalSetup;
module.exports = Pose;

},{}],79:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
/**
 * @param {number} inPoint - clip start time in seconds.
 * @param {number} outPoint - clip end time in seconds.
 * @param {number} speed - speed modifier (2 means twice as fast)
 * @constructor
 */
var RelativeTimeClip = function (inPoint, outPoint, speed) {
    if (outPoint < inPoint) {
        throw new Error("RelativeTimeClip: out point " + outPoint + " is less than in point " + inPoint);
    }
    if (speed < 0) {
        throw new Error("RelativeTimeClip: speed is negative: " + speed);
    }
    /**
     * @return {number}
     */
    this.getInPoint = function () { return inPoint; };
    /**
     * @return {number}
     */
    this.getOutPoint = function () { return outPoint; };
    /**
     * @return {number}
     */
    this.getSpeed = function () { return speed; };
    /**
     * @return {number}
     */
    this.getDuration = function () {
        if (speed === 0) {
            return Number.MAX_VALUE;
        }
        var clipDuration = outPoint - inPoint;
        return clipDuration / speed;
    };
    /**
     * Gets the time in seconds relative to the source data for the given "clip time" in seconds.
     * @param {number} clipTime - time in seconds relative to the start of the clip
     * @return {number} - time in seconds relative to the start of the source data
     */
    this.getSourceTime = function (clipTime) {
        if (clipTime < 0) {
            clipTime = 0;
        }
        var sourceTime = clipTime * speed + inPoint;
        if (sourceTime > outPoint) {
            sourceTime = outPoint;
        }
        return sourceTime;
    };
};
module.exports = RelativeTimeClip;

},{}],80:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var CyclicDOFTargetSelector = require("./CyclicDOFTargetSelector");
var CyclicMath = require("./CyclicMath");
/**
 * CyclicDOFTargetSelector for the case where the parent motion we are compensating
 * for is on-axis with our own motion, and therefore the solution can be a computed
 * as a scalar without 3d math.
 *
 * @param {string} dofName
 * @param {string[]} alignedParents - all parents that contribute to motion of this joint (all must be axis aligned)
 * @param {number[]} parentDirections - sign of the direction for these parents, relative to us (-1 or 1)
 * @constructor
 * @extends CyclicDOFTargetSelector
 */
var SeriesAlignedAxesTargetSelector = function (dofName, alignedParents, parentDirections) {
    CyclicDOFTargetSelector.call(this, dofName);
    this._alignedParents = alignedParents;
    this._parentDirections = parentDirections;
};
SeriesAlignedAxesTargetSelector.prototype = Object.create(CyclicDOFTargetSelector.prototype);
SeriesAlignedAxesTargetSelector.prototype.constructor = SeriesAlignedAxesTargetSelector;
/**
 *
 * Compute value for our DOF, rotationally equivalent to the value it has
 * in targetPose, but that causes it to go the short (or the otherwise
 * preferable) way around from currentPose
 *
 * This may rely on the currentPose and targetPose values being the correct
 * sign, i.e., the ancestor values are going to be used as-is, not same-sided
 * after this point. (Except for the sign of our dof in targetPose pose, of
 * course, which is what we're computing)
 *
 * @param {Pose} currentPose - current pose (should include current position of theDOF)
 * @param {Pose} targetPose - target pose (should include target position of theDOF)
 * @override
 * @return {number} target for this DOF (from targetPose), made into the "close-path" equivalent value for theDOF
 */
SeriesAlignedAxesTargetSelector.prototype.closestEquivalentRotation = function (currentPose, targetPose) {
    //find our motion from current to target due to our parents
    var parentMotion = 0;
    for (var i = 0; i < this._alignedParents.length; i++) {
        var aParentCurrent = currentPose.get(this._alignedParents[i], 0);
        var aParentTarget = targetPose.get(this._alignedParents[i], 0);
        var aParentMotion = aParentTarget - aParentCurrent;
        parentMotion += this._parentDirections[i] * aParentMotion;
    }
    var finalOrientation = targetPose.get(this.getDOFName(), 0);
    var initialOrientation = currentPose.get(this.getDOFName(), 0);
    var referenceRotation = initialOrientation - parentMotion;
    return CyclicMath.closestEquivalentRotation(finalOrientation, referenceRotation);
};
module.exports = SeriesAlignedAxesTargetSelector;

},{"./CyclicDOFTargetSelector":69,"./CyclicMath":70}],81:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @constructor
 */
var TimestampedBuffer = function () {
    /** @type {Array.<number>} */
    this.timestampList = [];
    /** @type {Array.<*>} */
    this.dataList = [];
    /** @type {number} */
    this._lastReturnedLeftIndex = 0;
};
TimestampedBuffer.prototype.clone = function () {
    var newBuffer = new TimestampedBuffer();
    //ok to shallow copy arrays since contents are numbers (immutable)
    newBuffer.timestampList = this.timestampList.slice(0);
    newBuffer.dataList = this.dataList.slice(0);
    newBuffer._lastReturnedLeftIndex = this._lastReturnedLeftIndex;
    return newBuffer;
};
/**
 * @return {number}
 */
TimestampedBuffer.prototype.size = function () {
    return this.timestampList.length;
};
/**
 * @return {number}
 */
TimestampedBuffer.prototype.getStartTime = function () {
    return this.timestampList[0];
};
/**
 * @return {number}
 */
TimestampedBuffer.prototype.getEndTime = function () {
    return this.timestampList[this.timestampList.length - 1];
};
/**
 * Append a sample to the buffer. This method assumes that the new sample is after (in time)
 * all samples already added; only use it when adding data in time-order.
 *
 * @param {number} timestamp
 * @param {*} data
 */
TimestampedBuffer.prototype.append = function (timestamp, data) {
    if (this.size() > 0) {
        if (timestamp < this.getEndTime()) {
            throw new Error("new timestamp " + timestamp + " is out of sequence with previous timestamp " + this.getEndTime());
        }
    }
    this.timestampList.push(timestamp);
    this.dataList.push(data);
};
/**
 * @param {number} index
 * @return {number} timestamp at the specified index
 */
TimestampedBuffer.prototype.getTimestamp = function (index) {
    return this.timestampList[index];
};
/**
 * @param {number} index
 * @return {*} data sample at the specified index
 */
TimestampedBuffer.prototype.getData = function (index) {
    return this.dataList[index];
};
/**
 * @param {number} index
 * @return {*} data sample that was removed
 */
TimestampedBuffer.prototype.remove = function (index) {
    this.timestampList.splice(index, 1);
    return this.dataList.splice(index, 1)[0];
};
/**
 * @param {number} time
 * @return {*} data
 */
TimestampedBuffer.prototype.getDataForTime = function (time) {
    var index = this.getLeftIndexForTime(time);
    if (index > -1) {
        return this.dataList[index];
    }
    else {
        return null;
    }
};
/**
 * Get all data for the provided time range.
 * @param {number} startTime start time of the range
 * @param {boolean} inclusiveStart true if data exactly at start time should be included
 * @param {number} endTime end time of the range
 * @param {boolean} inclusiveEnd true if data exactly at end time should be included
 * @return {Array} the data for the time range, in order, or null if no data in range
 */
TimestampedBuffer.prototype.getDataForRange = function (startTime, inclusiveStart, endTime, inclusiveEnd) {
    var rangedData = null;
    var startIndex = this.getLeftIndexForTime(startTime);
    var endIndex = this.getLeftIndexForTime(endTime) + 1;
    for (var i = startIndex; i <= endIndex; i++) {
        if (i >= 0 && i < this.size()) {
            var ts = this.getTimestamp(i);
            var startOK = ts > startTime || (ts === startTime && inclusiveStart);
            var endOK = ts < endTime || (ts === endTime && inclusiveEnd);
            if (startOK && endOK) {
                if (rangedData === null) {
                    rangedData = [];
                }
                rangedData.push(this.getData(i));
            }
        }
    }
    return rangedData;
};
/**
 * Insert unordered data.  If data already exists at the exact specified timestamp, it will be replaced with this data.
 * Otherwise, this data will be added in the correct place, associated with the specified timestamp.
 * @param timestamp time stamp to add or alter
 * @param data data to set
 */
TimestampedBuffer.prototype.insert = function (timestamp, data) {
    var leftIndex = this.getLeftIndexForTime(timestamp);
    if (leftIndex >= 0 && this.timestampList[leftIndex] === timestamp) {
        this.dataList[leftIndex] = data;
    }
    else {
        var insertAt = leftIndex + 1;
        this.timestampList.splice(insertAt, 0, timestamp);
        this.dataList.splice(insertAt, 0, data);
    }
};
/**
 * find index of timestamp s.t. stamps[index] <= time && stamps[index+1] > time
 * OR -1 if buffer is empty or time < startTime
 * OR last index if time >= endTime
 *
 * @param time time to search for
 * @return {number} index
 */
TimestampedBuffer.prototype.getLeftIndexForTime = function (time) {
    if (this.size() === 0 || time < this.getStartTime()) {
        return -1;
    }
    if (time >= this.getEndTime()) {
        return this.size() - 1;
    }
    // check the last returned left index
    if (this._lastReturnedLeftIndex < this.size() - 1 &&
        this.timestampList[this._lastReturnedLeftIndex] <= time &&
        this.timestampList[this._lastReturnedLeftIndex + 1] > time) {
        return this._lastReturnedLeftIndex;
    }
    // then, check the next one
    this._lastReturnedLeftIndex++;
    if (this._lastReturnedLeftIndex < this.size() - 1 &&
        this.timestampList[this._lastReturnedLeftIndex] <= time &&
        this.timestampList[this._lastReturnedLeftIndex + 1] > time) {
        return this._lastReturnedLeftIndex;
    }
    // no match yet, so find via binary search
    var leftIndex = 0;
    var rightIndex = this.size() - 1;
    var middleIndex;
    while (rightIndex !== leftIndex + 1) {
        middleIndex = Math.floor((leftIndex + rightIndex) / 2);
        if (this.timestampList[middleIndex] <= time) {
            leftIndex = middleIndex;
        }
        else {
            rightIndex = middleIndex;
        }
    }
    this._lastReturnedLeftIndex = leftIndex;
    return leftIndex;
};
TimestampedBuffer.prototype.toString = function () {
    var s = "";
    var delim = "";
    for (var i = 0; i < this.timestampList.length; i++) {
        s += delim + this.timestampList[i] + ":" + this.dataList[i];
        delim = ", ";
    }
    return s;
};
module.exports = TimestampedBuffer;

},{}],82:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelControl = require("./ModelControl");
var ModelControlFactory = require("./ModelControlFactory");
var THREE = require("@jibo/three");
/**
 * @constructor
 * @extends ModelControl
 */
var ColorControl = function () {
    ModelControl.call(this);
    /** @type {Array.<string>} */
    this._meshNames = null;
    /** @type {Array.<string>} */
    this._ledNames = null;
    /** @type {Array.<THREE.Mesh>} */
    this._meshes = [];
    /**
     * @type {boolean}
     * @private
     */
    this._billboardMode = true;
};
ColorControl.prototype = Object.create(ModelControl.prototype);
ColorControl.prototype.constructor = ColorControl;
ColorControl.prototype._controlType = "COLOR";
/**
 * @param {Object} jsonData
 * @override
 */
ColorControl.prototype.setFromJson = function (jsonData) {
    ModelControl.prototype.setFromJson.call(this, jsonData);
    this._dofNames.push(jsonData.redDOFName);
    this._dofNames.push(jsonData.greenDOFName);
    this._dofNames.push(jsonData.blueDOFName);
    if (jsonData.alphaDOFName) {
        this._dofNames.push(jsonData.alphaDOFName);
    }
    this._meshNames = jsonData.meshNames;
    if (jsonData.ledNames) {
        this._ledNames = jsonData.ledNames;
    }
};
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 * @override
 */
ColorControl.prototype.attachToModel = function (modelMap) {
    this._meshes.length = 0; //clear all meshes
    if (modelMap == null) {
        return false;
    }
    for (var meshIndex = 0; meshIndex < this._meshNames.length; meshIndex++) {
        if (modelMap.hasOwnProperty(this._meshNames[meshIndex])) {
            this._meshes.push(modelMap[this._meshNames[meshIndex]]);
        }
        else {
            return false;
        }
    }
    return true;
};
/**
 *
 * @param {boolean} billboard - true for billboard (emissive) mode, false for normal (diffuse) mode
 */
ColorControl.prototype.setBillboardMode = function (billboard) {
    if (billboard !== this._billboardMode) {
        if (this._meshes.length > 0) {
            var setDiffuse = new THREE.Color(0, 0, 0);
            var setEmissive = new THREE.Color(0, 0, 0);
            if (billboard) {
                //move existing color from diffuse to emissive, other to 0
                setEmissive.copy(this._meshes[0].material.color);
            }
            else {
                //move existing color from emissive to diffuse, other to 0
                setDiffuse.copy(this._meshes[0].material.emissive);
            }
            for (var meshIndex = 0; meshIndex < this._meshes.length; meshIndex++) {
                this._meshes[meshIndex].material.emissive.copy(setEmissive);
                this._meshes[meshIndex].material.color.copy(setDiffuse);
            }
        }
        this._billboardMode = billboard;
    }
};
/***
 *
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
function updateFromRGBA(r, g, b, a) {
    for (var meshIndex = 0; meshIndex < this._meshes.length; meshIndex++) {
        if (this._billboardMode) {
            this._meshes[meshIndex].material.emissive.setRGB(r, g, b);
        }
        else {
            this._meshes[meshIndex].material.color.setRGB(r, g, b);
        }
        if (a !== undefined) {
            this._meshes[meshIndex].material.opacity = a;
        }
    }
}
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 * @override
 */
ColorControl.prototype.updateFromDOFValues = function (dofValues) {
    var dofValueList = [];
    var dofIndex;
    for (dofIndex = 0; dofIndex < this._dofNames.length; dofIndex++) {
        if (dofValues.hasOwnProperty(this._dofNames[dofIndex])) {
            dofValueList.push(dofValues[this._dofNames[dofIndex]]);
        }
        else {
            return false;
        }
    }
    if (this._meshes.length > 0) {
        updateFromRGBA.call(this, dofValueList[0], dofValueList[1], dofValueList[2], dofValueList[3]);
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 * @override
 */
ColorControl.prototype.updateFromPose = function (pose) {
    var dofValueList = [];
    var dofIndex;
    for (dofIndex = 0; dofIndex < this._dofNames.length; dofIndex++) {
        var c = pose.get(this._dofNames[dofIndex], 0);
        if (c != null) {
            dofValueList.push(c);
        }
        else {
            return false;
        }
    }
    if (this._meshes.length > 0) {
        updateFromRGBA.call(this, dofValueList[0], dofValueList[1], dofValueList[2], dofValueList[3]);
        return true;
    }
    else {
        return false;
    }
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {ColorControl} copyInto - optional object to copy into
 * @return {ColorControl} copy of this dof, not attached to any model
 * @override
 */
ColorControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new ColorControl();
    }
    ModelControl.prototype.getCopy.call(this, copyInto);
    copyInto._meshNames = this._meshNames ? this._meshNames.slice(0) : null;
    copyInto._ledNames = this._ledNames ? this._ledNames.slice(0) : null;
    return copyInto;
};
/**
 * @constructor
 */
ColorControl.Factory = function () {
};
ColorControl.Factory.prototype = Object.create(ModelControlFactory.prototype);
ColorControl.Factory.prototype.constructor = ColorControl.Factory;
ColorControl.Factory.prototype._controlType = ColorControl.prototype._controlType;
ColorControl.Factory.prototype._controlConstructor = ColorControl;
module.exports = ColorControl;

},{"./ModelControl":85,"./ModelControlFactory":86,"@jibo/three":undefined}],83:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * Protected constructor for internal use only.
 *
 * @param {string} dofName - Protected constructor parameter.
 * @param {ModelControl} modelControl - Protected constructor parameter.
 * @class DOFInfo
 * @intdocs
 * @memberof jibo.animate
 * @protected
 */
var DOFInfo = function (dofName, modelControl) {
    /** @type {string} */
    /** @private */
    this._dofName = dofName;
    /** @type {string} */
    /** @private */
    this._controlType = null;
    /** @type {boolean} */
    /** @private */
    this._isMetric = false;
    /** @type {boolean} */
    /** @private */
    this._isCyclic = false;
    /** @type {number} */
    /** @private */
    this._min = undefined;
    /** @type {number} */
    /** @private */
    this._max = undefined;
    /** @type {Object.<string, number>} */
    /** @private */
    this._limitData = {};
    this.setFromModelControl(modelControl);
};
/**
 * @param {ModelControl} modelControl
 * @private
 */
DOFInfo.prototype.setFromModelControl = function (modelControl) {
    this._controlType = modelControl.getControlType();
    this._isMetric = (this._controlType !== "TEXTURE" && this._controlType !== "VISIBILITY");
    this._isCyclic = (this._controlType === "ROTATION" && modelControl.isCyclic());
    if (this._controlType === "ROTATION") {
        this._min = this._isCyclic ? -Math.PI : modelControl.getMin();
        this._max = this._isCyclic ? Math.PI : modelControl.getMax();
    }
    else if (this._controlType === "TRANSLATION") {
        var dofIndex = modelControl.getDOFNames().indexOf(this._dofName);
        if (dofIndex > -1) {
            this._min = modelControl._minList[dofIndex];
            this._max = modelControl._maxList[dofIndex];
        }
    }
    else if (this._controlType === "COLOR") {
        this._min = 0;
        this._max = 1;
    }
};
/**
 * @return {string}
 */
DOFInfo.prototype.getDOFName = function () {
    return this._dofName;
};
/**
 * Gets the control type associated with this DOF.
 * @method jibo.animate.DOFInfo#getControlType
 * @return {string}
 */
DOFInfo.prototype.getControlType = function () {
    return this._controlType;
};
/**
 * Returns whether or not this DOF exists in a metric space, i.e.
 * with a meaningful distance function, a well-defined minimum and maximum, etc.
 * @method jibo.animate.DOFInfo#isMetric
 * @return {boolean}
 */
DOFInfo.prototype.isMetric = function () {
    return this._isMetric;
};
/**
 * Returns whether or not this DOF is cyclical (for example, a continuous rotational joint).
 * @method jibo.animate.DOFInfo#isCyclic
 * @return {boolean}
 */
DOFInfo.prototype.isCyclic = function () {
    return this._isCyclic;
};
/**
 * Returns the minimum value for this DOF (may be undefined).
 * @method jibo.animate.DOFInfo#getMin
 * @return {number}
 */
DOFInfo.prototype.getMin = function () {
    return this._min;
};
/**
 * Returns the maximum value for this DOF (may be undefined).
 * @method jibo.animate.DOFInfo#getMax
 * @return {number}
 */
DOFInfo.prototype.getMax = function () {
    return this._max;
};
/**
 * Sets optional limit values.
 * @param {Object.<string, number>} limitData
 * @private
 */
DOFInfo.prototype.setLimitData = function (limitData) {
    var limitKeys = Object.keys(limitData);
    for (var i = 0; i < limitKeys.length; i++) {
        this._limitData[limitKeys[i]] = limitData[limitKeys[i]];
    }
};
/**
 * Returns the value for the specified limit (may be undefined).
 * @method jibo.animate.DOFInfo#getLimit
 * @param {string} limitName - The requested limit (e.g. "velocity").
 * @return {number} - The limit value, or undefined if no limit is specified.
 */
DOFInfo.prototype.getLimit = function (limitName) {
    return this._limitData[limitName];
};
module.exports = DOFInfo;

},{}],84:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Pose = require("../base/Pose");
/**
 * @class THREE.Object3D
 * @property {boolean} _nodeDirtyToKG - indicate that this node has update position or rotation and needs local matrix update (it's children will also need world matrix updates)
 */
/**
 * THREE will update the "rotation" of each node with every quaternion update.
 * The quaternion rep is used by THREE to do the local/world frames, neither THREE
 * nor KG uses the rotation for the uses here, so let's save time and not update
 * them by removing the change listener on the quaternions.
 *
 * THREE will normally update the entire tree to get up to date world/local frames.
 * We're adding a dirty flag so we can skip local updates of nodes that haven't changed,
 * and global updates of those whose parents haven't as well.
 *
 * @param {THREE.Object3D} node
 */
var configureTHREETree = function (node) {
    //strip the quatnernion change listener to stop updates of "rotation"
    node.quaternion.onChange(function () { });
    //add our own "dirty" flag which we will use to do less updating of world frames when things don't move
    node._nodeDirtyToKG = true;
    //node._parentDirtyToKG = true;
    for (var i = 0; i < node.children.length; i++) {
        configureTHREETree(node.children[i]);
    }
};
/**
 *
 * @param {ModelControlGroup} modelControlGroup
 * @param {THREE.Object3D} hierarchyRoot
 * @constructor
 */
var KinematicGroup = function (modelControlGroup, hierarchyRoot) {
    /**
     * @type {ModelControlGroup}
     * @private
     */
    this._modelControlGroup = modelControlGroup;
    /**
     * @type {THREE.Object3D}
     * @private
     */
    this._hierarchyRoot = hierarchyRoot;
    /** @type {Object<string, THREE.Object3D>} */
    this._modelMap = null;
    /**
     * @type {Pose}
     * @private
     */
    this._lastPose = new Pose("KG Last Pose", modelControlGroup.getDOFNames());
    configureTHREETree(this._hierarchyRoot);
    /**
     * if "true", we assume that no one else is modifying our transform hierarchy, so we can
     * lazy-update because we know which transforms will have changed
     *
     * @type {boolean}
     * @private
     */
    this._assumeKGHasSoleHierarcyControl = true;
};
/**
 * Copy tree, but only nodes in map.  Assumes that "node" is in map
 *
 * @param node
 * @param {Object.<string,boolean>} includeNamesMap - map of boolean values, true to include.  assumed to be continuous and touch root.
 */
var copyTree = function (node, includeNamesMap) {
    var n = node.clone(undefined, false);
    for (var i = 0; i < node.children.length; i++) {
        var c = node.children[i];
        if (c.name != null && includeNamesMap[c.name]) {
            n.add(copyTree(c, includeNamesMap));
        }
    }
    return n;
};
var printTree = function (node, tabs) {
    if (tabs == null) {
        tabs = "";
    }
    console.log(tabs + node.name);
    for (var i = 0; i < node.children.length; i++) {
        printTree(node.children[i], tabs + "\t");
    }
};
var treeToString = function (node, tabs) {
    if (tabs == null) {
        tabs = "";
    }
    var s = tabs + node.name;
    for (var i = 0; i < node.children.length; i++) {
        s += "\n" + treeToString(node.children[i], tabs + "\t");
    }
    return s;
};
/**
 * Get a copy of this KinematicGroup, including a copy of the transform hierarchy and a copy of the ModelControls,
 * bound to the new hierarchy.  If requiredTransforms is present, the copy will include a sub-tree of the original
 * hierarchy, with only transforms required to connect the required transforms to the root.  Only ModelControls
 * associated with those branches will be included.
 *
 * If kinematicOnly is true, the copy will only include controls that are associated with the motion of transforms,
 * not any render-only controls (e.g, texture, color, etc.).
 *
 * @param {string[]} [requiredTransforms] - if present, only include chains connecting root to required transforms
 * @param {boolean} [kinematicOnly=true] - if true, only include ModelControls that represent kinematic motions
 * @returns {KinematicGroup}
 */
KinematicGroup.prototype.getCopy = function (requiredTransforms, kinematicOnly) {
    //TODO: support requiredTransforms and kinematicOnly
    //TODO: get meshes out of here!
    var copiedHierarchy;
    if (requiredTransforms != null && this._hierarchyRoot != null) {
        var toInclude = {};
        var modelMap = this.getModelMap();
        for (var i = 0; i < requiredTransforms.length; i++) {
            var t = modelMap[requiredTransforms[i]];
            while (t != null) {
                if (!toInclude.hasOwnProperty(t.name)) {
                    toInclude[t.name] = true;
                    t = t.parent;
                }
                else {
                    t = null; //met up with already traversed root
                }
            }
        }
        if (toInclude[this._hierarchyRoot.name]) {
            copiedHierarchy = copyTree(this._hierarchyRoot, toInclude);
        }
        else {
            console.log("Warning, none of required dofs (" + (requiredTransforms == null ? "null" : requiredTransforms.toString()) + ")present in hierarchy!");
            copiedHierarchy = null;
        }
    }
    else {
        copiedHierarchy = this._hierarchyRoot ? this._hierarchyRoot.clone() : null;
    }
    var copiedGroup = this._modelControlGroup ? this._modelControlGroup.getCopy() : null;
    copiedGroup.attachToModelAndPrune(copiedHierarchy);
    //if(requiredTransforms!=null) {
    //	console.log("MADE TREE! for trans " + requiredTransforms.toString());
    //	printTree(copiedHierarchy);
    //}
    return new KinematicGroup(copiedGroup, copiedHierarchy);
};
/**
 *
 * @param {Pose} inplacePose
 * @return {Pose}
 */
KinematicGroup.prototype.getPose = function (inplacePose) {
};
/**
 *
 * @param {Pose} pose
 */
KinematicGroup.prototype.setFromPose = function (pose) {
    if (!this._assumeKGHasSoleHierarcyControl || !this._lastPose.equalsNoChange0Only(pose)) {
        this._modelControlGroup.updateFromPose(pose);
        this._lastPose.setPose(pose);
    }
};
/**
 * Update the world coordinate frames of the attached hierarchy.  This function relies on all
 * modifies of the Object3D tree setting the _nodeDirtyToKG flag on the objects.
 */
KinematicGroup.prototype.updateWorldCoordinateFrames = function () {
    var i, length;
    var root = this._hierarchyRoot;
    var parentDirty = false;
    if (root._nodeDirtyToKG) {
        root.updateMatrix();
        root._nodeDirtyToKG = false;
        root.matrixWorld.copy(root.matrix);
        parentDirty = true;
    }
    length = root.children.length;
    for (i = 0; i < length; i++) {
        this._updateWorldCoordinateFramesRecurse(root.children[i], parentDirty);
    }
};
/**
 * Called by updateWorldCoordinateFrames to recursively update the rest of the tree
 * as necessary.
 *
 * @param {THREE.Object3D} node - node to update (can NOT be the root of the tree)
 * @param {boolean} parentDirty - true if the parents of this node have been updated
 * @private
 */
KinematicGroup.prototype._updateWorldCoordinateFramesRecurse = function (node, parentDirty) {
    var i, length;
    if (node._nodeDirtyToKG) {
        node.updateMatrix();
        node._nodeDirtyToKG = false;
        parentDirty = true;
    }
    if (parentDirty) {
        node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
    }
    length = node.children.length;
    for (i = 0; i < length; i++) {
        this._updateWorldCoordinateFramesRecurse(node.children[i], parentDirty);
    }
};
///**
// * Calls the original full-update from THREE
// */
//KinematicGroup.prototype.updateWorldCoordinateFramesOriginal = function(){
//	this._hierarchyRoot.updateMatrixWorld();
//};
//
//
///**
// * Update the world coordinate frames of the attached hierarchy.  A non-recursive
// * technique.  Seems slightly slower than the recursive version.
// */
//KinematicGroup.prototype.updateWorldCoordinateFramesb = function(){
//	var i = 0, length = 0;
//
//	var root = this._hierarchyRoot;
//	var processNodesCleanParent = [];
//	var processNodesDirtyParent = [];
//
//	//console.log("beginO");
//
//	if (root._nodeDirtyToKG){
//		root.updateMatrix();
//		root._nodeDirtyToKG = false;
//		root.matrixWorld.copy(root.matrix);
//		length = root.children.length;
//		for(i = 0; i < length; i++){
//			processNodesDirtyParent.push(root.children[i]);
//		}
//		//console.log("processing update of root");
//	}else{
//		//console.log("skipping update of root");
//		length = root.children.length;
//		for(i = 0; i < length; i++){
//			processNodesCleanParent.push(root.children[i]);
//		}
//	}
//
//
//	/**
//	 * @type {THREE.Object3D}
//	 */
//	var node = processNodesCleanParent.pop();
//
//	//unrolled this logic a bit.  track parent dirty status with the different lists instead of setting a field.
//
//	while(node !== undefined){
//		if(node._nodeDirtyToKG){
//			node.updateMatrix();
//			node._nodeDirtyToKG = false;
//
//			node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
//
//			length = root.children.length;
//			for(i = 0; i < length; i++){
//				processNodesDirtyParent.push(node.children[i]);
//			}
//		}else{
//			length = root.children.length;
//			for(i = 0; i < length; i++){
//				processNodesCleanParent.push(node.children[i]);
//			}
//		}
//		node = processNodesCleanParent.pop();
//	}
//
//	node = processNodesDirtyParent.pop();
//
//	while(node !== undefined){
//		if(node._nodeDirtyToKG){
//			node.updateMatrix();
//			node._nodeDirtyToKG = false;
//
//			node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
//
//			length = root.children.length;
//			for(i = 0; i < length; i++){
//				processNodesDirtyParent.push(node.children[i]);
//			}
//		}else{
//			node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
//
//			length = root.children.length;
//			for(i = 0; i < length; i++){
//				processNodesDirtyParent.push(node.children[i]);
//			}
//		}
//		node = processNodesDirtyParent.pop();
//	}
//};
/**
 * @return {string[]}
 */
KinematicGroup.prototype.getDOFNames = function () {
    return this._modelControlGroup.getDOFNames();
};
/**
 * @return {ModelControlGroup}
 */
KinematicGroup.prototype.getModelControlGroup = function () {
    return this._modelControlGroup;
};
/**
 * @return {THREE.Object3D}
 */
KinematicGroup.prototype.getRoot = function () {
    return this._hierarchyRoot;
};
/**
 * @param {THREE.Vector3} hierarchyRoot
 * @returns {Object.<string, THREE.Object3D>}
 */
KinematicGroup.generateTransformMap = function (hierarchyRoot) {
    /** @type {Object.<string, THREE.Object3D>} */
    var modelMap = {};
    // flatten model tree
    /** @type {Array.<THREE.Object3D>} */
    var nodesToVisit = [hierarchyRoot];
    while (nodesToVisit.length > 0) {
        var node = nodesToVisit.shift();
        if (node.name) {
            modelMap[node.name] = node;
        }
        if (node.children) {
            for (var c = 0; c < node.children.length; c++) {
                nodesToVisit.push(node.children[c]);
            }
        }
    }
    return modelMap;
};
/**
 * @return {Object<string, THREE.Object3D>}
 */
KinematicGroup.prototype.getModelMap = function () {
    if (!this._modelMap) {
        this._modelMap = KinematicGroup.generateTransformMap(this._hierarchyRoot);
    }
    return this._modelMap;
};
/**
 * @param {string} transformName
 * @return {THREE.Object3D}
 */
KinematicGroup.prototype.getTransform = function (transformName) {
    if (!this._modelMap) {
        this._modelMap = KinematicGroup.generateTransformMap(this._hierarchyRoot);
    }
    return this._modelMap[transformName];
};
KinematicGroup.prototype.toString = function () {
    return "KinematicGroup:\n\tDOFs:" + this.getDOFNames() + "\n\tTree:\n" + treeToString(this._hierarchyRoot, "\t\t") + "\n\tNumControls:" + this._modelControlGroup.getControlList().length;
};
module.exports = KinematicGroup;

},{"../base/Pose":78}],85:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
/**
 * @constructor
 */
var ModelControl = function () {
    /** @type {Array.<string>} */
    this._controlNames = [];
    /** @type {Array.<string>} */
    this._dofNames = [];
};
/** @type {string} */
ModelControl.prototype._controlType = null;
/**
 * @param {Object} jsonData
 */
ModelControl.prototype.setFromJson = function (jsonData) {
    if (jsonData.controlName) {
        this._controlNames.push(jsonData.controlName);
    }
};
/**
 * @return {string}
 */
ModelControl.prototype.getControlType = function () {
    return this._controlType;
};
/**
 * @return {Array.<string>}
 */
ModelControl.prototype.getControlNames = function () {
    return this._controlNames;
};
/**
 * @return {Array.<string>}
 */
ModelControl.prototype.getDOFNames = function () {
    return this._dofNames;
};
/**
 * @return {Array.<string>}
 */
ModelControl.prototype.getTransformNames = function () {
    return null;
};
/**
 * @return {string}
 */
ModelControl.prototype.getDescriptiveName = function () {
    if (this._controlNames.length === 0) {
        return null;
    }
    else if (this._controlNames.length === 1) {
        return this._controlNames[0];
    }
    else {
        var names = this._controlNames[0];
        for (var i = 1; i < this._controlNames.length; i++) {
            names = names + ", " + this._controlNames[i];
        }
        return "MultiControl<" + names + ">";
    }
};
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 */
ModelControl.prototype.attachToModel = function (modelMap) {
    return false;
};
/**
 * Called once when control list is assigned to a group, used by controls
 * which need to make links amongst themselves.
 * @param {ModelControlGroup} controlGroup
 */
ModelControl.prototype.attachToControlGroup = function (controlGroup) { }; // eslint-disable-line no-unused-vars
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 */
ModelControl.prototype.updateFromDOFValues = function (dofValues) {
    return false;
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 */
ModelControl.prototype.updateFromPose = function (pose) {
    return false;
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {ModelControl} copyInto - optional object to copy into
 * @return {ModelControl} copy of this dof, not attached to any model
 */
ModelControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new ModelControl();
    }
    copyInto._controlNames = this._controlNames ? this._controlNames.slice(0) : null;
    copyInto._dofNames = this._dofNames ? this._dofNames.slice(0) : null;
    copyInto._controlType = this._controlType;
};
module.exports = ModelControl;

},{}],86:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
/**
 * @constructor
 */
var ModelControlFactory = function () {
    /** @type {string} */
    this._controlType = null;
    this._controlConstructor = null;
};
/**
 * @return {string}
 */
ModelControlFactory.prototype.getControlType = function () {
    return this._controlType;
};
/**
 * @param {Object} jsonData
 * @return {ModelControl}
 */
ModelControlFactory.prototype.constructFromJson = function (jsonData) {
    if (jsonData.controlType !== this._controlType) {
        console.warn("ModelControlFactory<" + this._controlType + ">: don't know how to construct for control type: " + jsonData.controlType);
        return null;
    }
    var control = new this._controlConstructor();
    control.setFromJson(jsonData);
    return control;
};
/**
 * @param {Array.<ModelControl>} controlList
 * @return {Array.<ModelControl>}
 */
ModelControlFactory.prototype.postProcessControlList = function (controlList) {
    return controlList;
};
module.exports = ModelControlFactory;

},{}],87:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var KinematicGroup = require("./KinematicGroup");
var DOFInfo = require("./DOFInfo");
/**
 * @constructor
 */
var ModelControlGroup = function () {
    /** @type {Array.<ModelControl>} */
    this._controlList = [];
    /** @type {string[]} */
    this._dofNames = [];
    /** @type {Object.<string, ModelControl>} */
    this._dofNameToControlMap = {};
    /** @type {Object.<string, DOFInfo>} */
    this._dofInfos = {};
};
/**
 * @param {Array.<ModelControl>} controlList
 */
ModelControlGroup.prototype.setControlList = function (controlList) {
    var controlIndex;
    this._controlList = controlList;
    this._dofNames = [];
    this._dofNameToControlMap = {};
    this._dofInfos = {};
    for (controlIndex = 0; controlIndex < this._controlList.length; controlIndex++) {
        var modelControl = this._controlList[controlIndex];
        var dofNames = modelControl.getDOFNames();
        for (var dofIndex = 0; dofIndex < dofNames.length; dofIndex++) {
            this._dofNames.push(dofNames[dofIndex]);
            this._dofNameToControlMap[dofNames[dofIndex]] = modelControl;
            this._dofInfos[dofNames[dofIndex]] = new DOFInfo(dofNames[dofIndex], modelControl);
        }
    }
    for (controlIndex = 0; controlIndex < this._controlList.length; controlIndex++) {
        this._controlList[controlIndex].attachToControlGroup(this);
    }
};
/**
 * @return {Array.<ModelControl>}
 */
ModelControlGroup.prototype.getControlList = function () {
    return this._controlList;
};
/**
 * @return {string[]}
 */
ModelControlGroup.prototype.getDOFNames = function () {
    return this._dofNames;
};
/**
 * @param {string} dofName
 * @return {ModelControl}
 */
ModelControlGroup.prototype.getControlForDOF = function (dofName) {
    return this._dofNameToControlMap[dofName];
};
/**
 * @param {string} dofName
 * @return {DOFInfo}
 */
ModelControlGroup.prototype.getDOFInfo = function (dofName) {
    return this._dofInfos[dofName];
};
/**
 * @param {THREE.Object3D} modelRoot
 * @return {!boolean}
 */
ModelControlGroup.prototype.attachToModel = function (modelRoot) {
    /** @type {Object.<string, THREE.Object3D>} */
    var modelMap = KinematicGroup.generateTransformMap(modelRoot);
    // flatten model tree
    ///** @type {Array.<THREE.Object3D>} */
    //var nodesToVisit = [modelRoot];
    //while (nodesToVisit.length > 0)
    //{
    //	var node = nodesToVisit.shift();
    //	if (node.name)
    //	{
    //		modelMap[node.name] = node;
    //	}
    //	if (node.children)
    //	{
    //		for (var c=0; c<node.children.length; c++)
    //		{
    //			nodesToVisit.push(node.children[c]);
    //		}
    //	}
    //}
    var attachedAll = true;
    for (var controlIndex = 0; controlIndex < this._controlList.length; controlIndex++) {
        var attached = this._controlList[controlIndex].attachToModel(modelMap);
        if (!attached) {
            attachedAll = false;
            console.warn("failed to attach model control: " + this._controlList[controlIndex].getDescriptiveName());
        }
    }
    return attachedAll;
};
/**
 * @param {THREE.Object3D} modelRoot
 */
ModelControlGroup.prototype.attachToModelAndPrune = function (modelRoot) {
    /** @type {Object.<string, THREE.Object3D>} */
    var modelMap = KinematicGroup.generateTransformMap(modelRoot);
    this.setControlList(this._controlList.filter(function (control) {
        return control.attachToModel(modelMap);
    }));
};
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 */
ModelControlGroup.prototype.updateFromDOFValues = function (dofValues) {
    var updatedAll = true;
    for (var controlIndex = 0; controlIndex < this._controlList.length; controlIndex++) {
        var updated = this._controlList[controlIndex].updateFromDOFValues(dofValues);
        if (!updated) {
            updatedAll = false;
        }
    }
    return updatedAll;
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 */
ModelControlGroup.prototype.updateFromPose = function (pose) {
    var updatedAll = true;
    for (var controlIndex = 0; controlIndex < this._controlList.length; controlIndex++) {
        var updated = this._controlList[controlIndex].updateFromPose(pose);
        if (!updated) {
            updatedAll = false;
        }
    }
    return updatedAll;
};
/**
 * @param {string[]} dofNames
 * @return {string[]}
 */
ModelControlGroup.prototype.getRequiredTransformNamesForDOFs = function (dofNames) {
    if (dofNames === null) {
        return null;
    }
    var r = [];
    for (var i = 0; i < dofNames.length; i++) {
        var control = this.getControlForDOF(dofNames[i]);
        var transformNames = control.getTransformNames();
        if (transformNames != null) {
            for (var j = 0; j < transformNames.length; j++) {
                r.push(transformNames[j]);
            }
        }
    }
    return r;
};
/**
 * @param {Pose} inplacePose
 * @return {!boolean}
 */
ModelControlGroup.prototype.getPose = function (inplacePose) {
    //TODO
};
/**
 * Get a copy of this group, differing only in that it will by unbound to any model.
 * @returns {ModelControlGroup}
 */
ModelControlGroup.prototype.getCopy = function () {
    if (this._controlList == null) {
        return new ModelControlGroup();
    }
    else {
        var controlsCopy = [this._controlList.length];
        for (var i = 0; i < this._controlList.length; i++) {
            controlsCopy[i] = this._controlList[i].getCopy(null);
        }
        var groupCopy = new ModelControlGroup();
        groupCopy.setControlList(controlsCopy);
        return groupCopy;
    }
};
module.exports = ModelControlGroup;

},{"./DOFInfo":83,"./KinematicGroup":84}],88:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelControl = require("./ModelControl");
var ModelControlFactory = require("./ModelControlFactory");
var BasicFrame = require("../../ifr-geometry/BasicFrame");
var THREE = require("@jibo/three");
/**
 * @constructor
 * @extends ModelControl
 */
var RotationControl = function () {
    ModelControl.call(this);
    /** @type {string} */
    this._skeletonFrameName = null;
    /** @type {THREE.Vector3} */
    this._rotationalAxis = new THREE.Vector3();
    /** @type {THREE.Quaternion} */
    this._initialRotation = new THREE.Quaternion();
    /** @type {number} */
    this._min = null;
    /** @type {number} */
    this._max = null;
    /** @type {boolean} */
    this._isCyclic = false;
    /** @type {THREE.Object3D} */
    this._skeletonFrame = null;
    /**
     * @type {number}
     * @private
     */
    this._lastValue = null;
};
RotationControl.prototype = Object.create(ModelControl.prototype);
RotationControl.prototype.constructor = RotationControl;
RotationControl.prototype._controlType = "ROTATION";
/**
 * @param {Object} jsonData
 * @override
 */
RotationControl.prototype.setFromJson = function (jsonData) {
    ModelControl.prototype.setFromJson.call(this, jsonData);
    this._dofNames.push(jsonData.dofName);
    this._skeletonFrameName = jsonData.skeletonFrameName;
    this._rotationalAxis.copy(BasicFrame.vector3FromJson(jsonData.xyzRotationAxis));
    this._initialRotation.copy(BasicFrame.quaternionFromJson(jsonData.wxyzQuatInitialRotation));
    this._min = jsonData.min;
    this._max = jsonData.max;
    this._isCyclic = jsonData.isCyclic | false;
};
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 * @override
 */
RotationControl.prototype.attachToModel = function (modelMap) {
    this._skeletonFrame = null;
    if (modelMap != null && modelMap.hasOwnProperty(this._skeletonFrameName)) {
        this._skeletonFrame = modelMap[this._skeletonFrameName];
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {number} dofValue
 */
function updateFromDOFVal(dofValue) {
    if (dofValue !== this._lastValue) {
        this._lastValue = dofValue;
        //dofValue = THREE.Math.clamp(dofValue, this._min, this._max);
        var rotationAroundAxis = new THREE.Quaternion().setFromAxisAngle(this._rotationalAxis, dofValue);
        this._skeletonFrame.quaternion.multiplyQuaternions(this._initialRotation, rotationAroundAxis);
        this._skeletonFrame._nodeDirtyToKG = true; //mark as dirty for KH CF updates
    }
}
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 * @override
 */
RotationControl.prototype.updateFromDOFValues = function (dofValues) {
    if (this._skeletonFrame && dofValues.hasOwnProperty(this._dofNames[0])) {
        var dofValue = dofValues[this._dofNames[0]];
        updateFromDOFVal.call(this, dofValue);
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 * @override
 */
RotationControl.prototype.updateFromPose = function (pose) {
    var dofValue = pose.get(this._dofNames[0], 0);
    if (this._skeletonFrame && (dofValue != null)) {
        updateFromDOFVal.call(this, dofValue);
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {THREE.Vector3 } inplaceVector3 - new vector will be created if null or omitted
 * @return {!THREE.Vector3} the rotational axis.  will be === inplaceVector3 if provided
 */
RotationControl.prototype.getRotationalAxis = function (inplaceVector3) {
    if (inplaceVector3 == null) {
        inplaceVector3 = new THREE.Vector3();
    }
    return inplaceVector3.copy(this._rotationalAxis);
};
/**
 * @param {THREE.Quaternion } inplaceQuaternion - new vector will be created if null or omitted
 * @return {!THREE.Quaternion} the initial rotation.  will be === inplaceQuaternion if provided
 */
RotationControl.prototype.getInitialRotation = function (inplaceQuaternion) {
    if (inplaceQuaternion == null) {
        inplaceQuaternion = new THREE.Quaternion();
    }
    return inplaceQuaternion.copy(this._initialRotation);
};
/**
 * @returns {number}
 */
RotationControl.prototype.getMin = function () {
    return this._min;
};
/**
 * @returns {number}
 */
RotationControl.prototype.getMax = function () {
    return this._max;
};
/**
 * @returns {boolean}
 */
RotationControl.prototype.isCyclic = function () {
    return this._isCyclic;
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {RotationControl} copyInto - optional object to copy into
 * @return {RotationControl} copy of this dof, not attached to any model
 * @override
 */
RotationControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new RotationControl();
    }
    ModelControl.prototype.getCopy.call(this, copyInto);
    copyInto._skeletonFrameName = this._skeletonFrameName;
    copyInto._rotationalAxis = this._rotationalAxis ? this._rotationalAxis.clone() : null;
    copyInto._initialRotation = this._initialRotation ? this._initialRotation.clone() : null;
    copyInto._min = this._min;
    copyInto._max = this._max;
    copyInto._isCyclic = this._isCyclic;
    return copyInto;
};
/**
 ** @returns {string}
 */
RotationControl.prototype.getTransformName = function () {
    return this._skeletonFrameName;
};
/**
 * @return {Array.<string>}
 * @override
 */
RotationControl.prototype.getTransformNames = function () {
    return [this.getTransformName()];
};
/**
 * @constructor
 */
RotationControl.Factory = function () {
};
RotationControl.Factory.prototype = Object.create(ModelControlFactory.prototype);
RotationControl.Factory.prototype.constructor = RotationControl.Factory;
RotationControl.Factory.prototype._controlType = RotationControl.prototype._controlType;
RotationControl.Factory.prototype._controlConstructor = RotationControl;
module.exports = RotationControl;

},{"../../ifr-geometry/BasicFrame":60,"./ModelControl":85,"./ModelControlFactory":86,"@jibo/three":undefined}],89:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelControl = require("./ModelControl");
var ModelControlFactory = require("./ModelControlFactory");
// var CachedImageLoader = require("../../ifr-geometry/loaders/CachedImageLoader");
var THREE = require("@jibo/three");
var slog = require("../../ifr-core/SLog");
/**
 * @constructor
 * @extends ModelControl
 */
var TextureControl = function () {
    ModelControl.call(this);
    /** @type {string} */
    this._meshName = null;
    /** @type {THREE.Mesh} */
    this._mesh = null;
    /** @type {THREE.Texture} */
    this._texture = null;
    /** @type {THREE.Texture} */
    this._normal = null;
    /** @type {THREE.DataTexture} */
    this._blankTexture = null;
    /** @type {CachedImageLoader} */
    this._imageLoader = null;
    /** @type {string} */
    this._defaultNormalURL = null;
    /** @type {ColorControl} */
    this._colorControl = null;
    /** @type {boolean} */
    this._billboardMode = true;
};
TextureControl.prototype = Object.create(ModelControl.prototype);
TextureControl.prototype.constructor = TextureControl;
TextureControl.prototype._controlType = "TEXTURE";
/**
 * @param {Object} jsonData
 */
TextureControl.prototype.setFromJson = function (jsonData) {
    ModelControl.prototype.setFromJson.call(this, jsonData);
    this._dofNames.push(jsonData.dofName);
    this._meshName = jsonData.meshName;
};
/**
 * @param {CachedImageLoader} imageLoader
 */
TextureControl.prototype.setImageLoader = function (imageLoader) {
    this._imageLoader = imageLoader;
};
/**
 * @param {string} normalURL
 */
TextureControl.prototype.setDefaultNormalURL = function (normalURL) {
    this._defaultNormalURL = normalURL;
};
/**
 * call once after a new mesh is attached to set colors for current render mode,
 * and cache original colors to be restored
 */
function initMesh() {
    //save the specular value in the mesh itself.  this way it will be preserved
    //to be re-enabled even if a new TextureControl is attached.
    if (this._mesh.material._specular_disabled == null) {
        this._mesh.material._specular_disabled = new THREE.Color(this._mesh.material.specular);
    }
    if (this._billboardMode) {
        this._mesh.material.ambient.setRGB(0, 0, 0);
        this._mesh.material.specular.setRGB(0, 0, 0);
    }
    else {
        this._mesh.material.ambient.setRGB(1, 1, 1);
        //restore original specular
        this._mesh.material.specular.set(this._mesh.material._specular_disabled);
    }
}
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 */
TextureControl.prototype.attachToModel = function (modelMap) {
    this._mesh = null;
    if (modelMap != null && modelMap.hasOwnProperty(this._meshName)) {
        /** @type {THREE.Texture} */
        this._texture = new THREE.Texture();
        this._texture.minFilter = THREE.LinearFilter;
        /** @type {THREE.Texture} */
        this._normal = new THREE.Texture();
        /** @type {THREE.DataTexture} */
        this._blankTexture = new THREE.DataTexture(new Uint8Array(2 * 2 * 4), 2, 2);
        this._blankTexture.minFilter = THREE.LinearFilter;
        this._mesh = modelMap[this._meshName];
        initMesh.call(this);
        return true;
    }
    else {
        return false;
    }
};
/**
 * Called once when control list is assigned to a group, used by controls
 * which need to make links amongst themselves.
 * @param {ModelControlGroup} controlGroup
 */
ModelControl.prototype.attachToControlGroup = function (controlGroup) {
    /** @type {ModelControl[]} */
    var controlList = controlGroup.getControlList();
    this._colorControl = null;
    //connect to a ColorControl that contains our mesh.
    for (var i = 0; i < controlList.length; i++) {
        if (controlList[i].getControlType() === "COLOR") {
            var colorMeshNames = controlList[i]._meshNames;
            for (var j = 0; j < colorMeshNames.length; j++) {
                if (colorMeshNames[j] === this._meshName) {
                    this._colorControl = controlList[i];
                    break;
                }
            }
        }
        if (this._colorControl !== null) {
            break;
        }
    }
};
/**
 *
 * @param {boolean} billboardMode
 */
function setBillboardMode(billboardMode) {
    if (this._colorControl !== null) {
        this._colorControl.setBillboardMode(billboardMode);
    }
    if (billboardMode !== this._billboardMode) {
        if (this._mesh !== null) {
            //color control will handle emissive/diffuse
            //we must handle ambient
            if (billboardMode) {
                this._mesh.material.ambient.setRGB(0, 0, 0);
                this._mesh.material.specular.setRGB(0, 0, 0);
            }
            else {
                this._mesh.material.ambient.setRGB(1, 1, 1);
                this._mesh.material.specular.set(this._mesh.material._specular_disabled); //stored here by initMesh
            }
        }
        this._billboardMode = billboardMode;
    }
}
/**
 * @param {number|string} dofValue
 * @return {!boolean}
 */
function updateFromDOFVal(dofValue) {
    if (typeof (dofValue) === "string") {
        setBillboardMode.call(this, true); //fallback mode, string only, choose billboard
        this.setTextureFromURL(dofValue);
        return true;
    }
    else if (typeof (dofValue) === "object") {
        var url = dofValue.textureURL;
        var useNormals = dofValue.useNormals;
        var normalURL = dofValue.normalURL;
        if (useNormals == null) {
            if (normalURL == null) {
                useNormals = false;
            }
            else {
                useNormals = true;
            }
        }
        if (useNormals === true && normalURL == null) {
            normalURL = this._defaultNormalURL;
        }
        if (useNormals === true) {
            this.setNormalFromURL(normalURL);
        }
        setBillboardMode.call(this, !useNormals);
        if (url == null) {
            slog.error("Value for DOF " + this._dofNames[0] + " is object, but did not contain field \"textureURL\"");
        }
        else {
            this.setTextureFromURL(url);
        }
    }
    else if (typeof (dofValue) === "number") {
        slog.error("TextureControl for DOF " + this._dofNames[0] + ": numerical values (image indices) are no longer supported, use full image URL instead");
        return false;
    }
    else {
        return false;
    }
}
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 */
TextureControl.prototype.updateFromDOFValues = function (dofValues) {
    if (this._mesh && dofValues.hasOwnProperty(this._dofNames[0])) {
        var dofValue = dofValues[this._dofNames[0]];
        return updateFromDOFVal.call(this, dofValue);
    }
    else {
        return false;
    }
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 */
TextureControl.prototype.updateFromPose = function (pose) {
    var dofValue = pose.get(this._dofNames[0], 0);
    if (this._mesh && (dofValue != null)) {
        return updateFromDOFVal.call(this, dofValue);
    }
    else {
        return false;
    }
};
/**
 * @param {string} imageURL
 * @private
 */
TextureControl.prototype.setTextureFromURL = function (imageURL) {
    if (this._mesh && this._texture.sourceFile !== imageURL) {
        this._texture.sourceFile = imageURL;
        this._blankTexture.needsUpdate = true;
        this._mesh.material.map = this._blankTexture;
        var self = this;
        this._imageLoader.loadImage(imageURL, function () {
            var result = self._imageLoader.getResult();
            if (result.success && result.url === self._texture.sourceFile) {
                self._texture.image = result.image;
                self._texture.needsUpdate = true;
                self._mesh.material.map = self._texture;
            }
            else if (!result.success) {
                slog.error("TextureControl for DOF " + self._dofNames[0] + ": image load failed, URL = " + result.url);
            }
        });
    }
};
/**
 * @param {string} normalURL
 * @private
 */
TextureControl.prototype.setNormalFromURL = function (normalURL) {
    if (this._mesh && this._normal.sourceFile !== normalURL) {
        this._normal.sourceFile = normalURL;
        //this._blankTexture.needsUpdate = true;
        //this._mesh.material.map = this._blankTexture;
        var self = this;
        this._imageLoader.loadImage(normalURL, function () {
            var result = self._imageLoader.getResult();
            if (result.success && result.url === self._normal.sourceFile) {
                self._normal.image = result.image;
                self._normal.needsUpdate = true;
                if (self._mesh.material.normalMap == null) {
                    self._mesh.material.needsUpdate = true;
                }
                self._mesh.material.normalMap = self._normal;
            }
            else if (!result.success) {
                slog.error("TextureControl for DOF " + self._dofNames[0] + ": normal load failed, URL = " + result.url);
            }
        });
    }
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {TextureControl} copyInto - optional object to copy into
 * @return {TextureControl} copy of this dof, not attached to any model
 * @override
 */
TextureControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new TextureControl();
    }
    ModelControl.prototype.getCopy.call(this, copyInto);
    copyInto._meshName = this._meshName;
    copyInto._texture = this._texture ? this._texture.clone() : null;
    copyInto._imageLoader = this._imageLoader;
    copyInto._defaultNormalURL = this._defaultNormalURL;
    return copyInto;
};
/**
 * @constructor
 */
TextureControl.Factory = function () {
    /** @type {CachedImageLoader} */
    this._sharedImageLoader = null;
};
TextureControl.Factory.prototype = Object.create(ModelControlFactory.prototype);
TextureControl.Factory.prototype.constructor = TextureControl.Factory;
TextureControl.Factory.prototype._controlType = TextureControl.prototype._controlType;
TextureControl.Factory.prototype._controlConstructor = TextureControl;
/**
 * @param {CachedImageLoader} sharedImageLoader
 */
TextureControl.Factory.prototype.setSharedImageLoader = function (sharedImageLoader) {
    this._sharedImageLoader = sharedImageLoader;
};
/**
 * @param {Object} jsonData
 * @return {ModelControl}
 */
TextureControl.Factory.prototype.constructFromJson = function (jsonData) {
    /** @type {TextureControl} */
    var textureControl = ModelControlFactory.prototype.constructFromJson.call(this, jsonData);
    if (textureControl) {
        textureControl.setImageLoader(this._sharedImageLoader);
    }
    return textureControl;
};
module.exports = TextureControl;

},{"../../ifr-core/SLog":57,"./ModelControl":85,"./ModelControlFactory":86,"@jibo/three":undefined}],90:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelControl = require("./ModelControl");
var ModelControlFactory = require("./ModelControlFactory");
var BasicFrame = require("../../ifr-geometry/BasicFrame");
var THREE = require("@jibo/three");
/**
 * @constructor
 * @extends ModelControl
 */
var TranslationControl = function () {
    ModelControl.call(this);
    /** @type {string} */
    this._skeletonFrameName = null;
    /** @type {THREE.Vector3} */
    this._initialPosition = new THREE.Vector3();
    /** @type {Array.<THREE.Vector3>} */
    this._translationalDirectionList = [];
    /** @type {Array.<number>} */
    this._minList = [];
    /** @type {Array.<number>} */
    this._maxList = [];
    /** @type {THREE.Object3D} */
    this._skeletonFrame = null;
    this._lastValue = [];
};
TranslationControl.prototype = Object.create(ModelControl.prototype);
TranslationControl.prototype.constructor = TranslationControl;
TranslationControl.prototype._controlType = "TRANSLATION";
/**
 * @param {Object} jsonData
 * @override
 */
TranslationControl.prototype.setFromJson = function (jsonData) {
    ModelControl.prototype.setFromJson.call(this, jsonData);
    this._dofNames.push(jsonData.dofName);
    this._skeletonFrameName = jsonData.skeletonFrameName;
    this._initialPosition.copy(BasicFrame.vector3FromJson(jsonData.xyzInitialPosition));
    this._translationalDirectionList.push(BasicFrame.vector3FromJson(jsonData.xyzTranslationDirection));
    this._minList.push(jsonData.min);
    this._maxList.push(jsonData.max);
};
/**
 * @param {TranslationControl} translationControlB
 */
TranslationControl.prototype.appendControl = function (translationControlB) {
    this._controlNames = this._controlNames.concat(translationControlB._controlNames);
    this._dofNames = this._dofNames.concat(translationControlB._dofNames);
    this._translationalDirectionList = this._translationalDirectionList.concat(translationControlB._translationalDirectionList);
    this._minList = this._minList.concat(translationControlB._minList);
    this._maxList = this._maxList.concat(translationControlB._maxList);
};
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 * @override
 */
TranslationControl.prototype.attachToModel = function (modelMap) {
    this._skeletonFrame = null;
    if (modelMap != null && modelMap.hasOwnProperty(this._skeletonFrameName)) {
        this._skeletonFrame = modelMap[this._skeletonFrameName];
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {number[]} dofValueList - values in order of our dofs
 * @param {boolean} [forceRecompute]
 * @return {THREE.Vector3}
 */
function computeForDOFValueList(dofValueList, forceRecompute) {
    var equal = true;
    for (var i = 0; i < dofValueList.length; i++) {
        if (dofValueList[i] !== this._lastValue[i]) {
            this._lastValue[i] = dofValueList[i];
            equal = false;
        }
    }
    if (!equal || forceRecompute) {
        var newPosition = new THREE.Vector3().copy(this._initialPosition);
        var deltaPosition = new THREE.Vector3();
        for (var dofIndex = 0; dofIndex < dofValueList.length; dofIndex++) {
            var dofValue = THREE.Math.clamp(dofValueList[dofIndex], this._minList[dofIndex], this._maxList[dofIndex]);
            deltaPosition.copy(this._translationalDirectionList[dofIndex]).multiplyScalar(dofValue);
            newPosition.add(deltaPosition);
        }
        return newPosition;
    }
    else {
        return null;
    }
}
/**
 * @param {Object.<string, Object>} dofValues
 * @param {boolean} [forceRecompute]
 * @return {THREE.Vector3} computed value (null if cannot compute)
 */
TranslationControl.prototype.computeFromDOFValues = function (dofValues, forceRecompute) {
    var dofValueList = [];
    for (var dofIndex = 0; dofIndex < this._dofNames.length; dofIndex++) {
        if (dofValues.hasOwnProperty(this._dofNames[dofIndex])) {
            dofValueList.push(dofValues[this._dofNames[dofIndex]]);
        }
        else {
            return null;
        }
    }
    return computeForDOFValueList.call(this, dofValueList, forceRecompute);
};
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 * @override
 */
TranslationControl.prototype.updateFromDOFValues = function (dofValues) {
    var newPosition = this.computeFromDOFValues(dofValues);
    if (newPosition != null && this._skeletonFrame != null) {
        this._skeletonFrame.position.copy(newPosition);
        this._skeletonFrame._nodeDirtyToKG = true; //mark as dirty for KH CF updates
        return true;
    }
    else {
        return false;
    }
};
/**
 * @param {Pose} pose
 * @return {THREE.Vector3} computed value (null if cannot compute)
 */
TranslationControl.prototype.computeFromPose = function (pose) {
    var dofValueList = [];
    for (var dofIndex = 0; dofIndex < this._dofNames.length; dofIndex++) {
        var val = pose.get(this._dofNames[dofIndex], 0);
        if (val != null) {
            dofValueList.push(val);
        }
        else {
            return null;
        }
    }
    return computeForDOFValueList.call(this, dofValueList);
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 * @override
 */
TranslationControl.prototype.updateFromPose = function (pose) {
    var newPosition = this.computeFromPose(pose);
    if (newPosition != null && this._skeletonFrame != null) {
        this._skeletonFrame.position.copy(newPosition);
        this._skeletonFrame._nodeDirtyToKG = true; //mark as dirty for KH CF updates
        return true;
    }
    else {
        return false;
    }
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {TranslationControl} copyInto - optional object to copy into
 * @return {TranslationControl} copy of this dof, not attached to any model
 * @override
 */
TranslationControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new TranslationControl();
    }
    ModelControl.prototype.getCopy.call(this, copyInto);
    copyInto._skeletonFrameName = this._skeletonFrameName;
    copyInto._initialPosition = this._initialPosition ? this._initialPosition.clone() : null;
    copyInto._translationalDirectionList = this._translationalDirectionList ? this._translationalDirectionList.slice(0) : null;
    if (copyInto._translationalDirectionList) {
        for (var i = 0; i < copyInto._translationalDirectionList.length; i++) {
            copyInto[i] = copyInto[i] ? copyInto[i].clone() : null;
        }
    }
    copyInto._minList = this._minList ? this._minList.slice(0) : this._minList;
    copyInto._maxList = this._maxList ? this._maxList.slice(0) : this._maxList;
    return copyInto;
};
/**
 ** @returns {string}
 */
TranslationControl.prototype.getTransformName = function () {
    return this._skeletonFrameName;
};
/**
 * @return {Array.<string>}
 * @override
 */
TranslationControl.prototype.getTransformNames = function () {
    return [this.getTransformName()];
};
/**
 * @constructor
 */
TranslationControl.Factory = function () {
};
TranslationControl.Factory.prototype = Object.create(ModelControlFactory.prototype);
TranslationControl.Factory.prototype.constructor = TranslationControl.Factory;
TranslationControl.Factory.prototype._controlType = TranslationControl.prototype._controlType;
TranslationControl.Factory.prototype._controlConstructor = TranslationControl;
/**
 * @param {Array.<ModelControl>} controlList
 * @return {Array.<ModelControl>}
 */
TranslationControl.Factory.prototype.postProcessControlList = function (controlList) {
    /** @type {Object.<string, TranslationControl>} */
    var translationControlMap = {};
    /** @type {Array.<ModelControl>} */
    var trimmedControlList = [];
    for (var c = 0; c < controlList.length; c++) {
        var control = controlList[c];
        if (control instanceof TranslationControl) {
            if (translationControlMap.hasOwnProperty(control._skeletonFrameName)) {
                var masterTranslationControl = translationControlMap[control._skeletonFrameName];
                masterTranslationControl.appendControl(control);
            }
            else {
                translationControlMap[control._skeletonFrameName] = control;
                trimmedControlList.push(control);
            }
        }
        else {
            trimmedControlList.push(control);
        }
    }
    return trimmedControlList;
};
module.exports = TranslationControl;

},{"../../ifr-geometry/BasicFrame":60,"./ModelControl":85,"./ModelControlFactory":86,"@jibo/three":undefined}],91:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var ModelControl = require("./ModelControl");
var ModelControlFactory = require("./ModelControlFactory");
var slog = require("../../ifr-core/SLog");
/**
 * @constructor
 * @extends ModelControl
 */
var VisibilityControl = function () {
    ModelControl.call(this);
    /** @type {Array.<string>} */
    this._meshNames = null;
    /** @type {Array.<THREE.Mesh>} */
    this._meshes = [];
    this._lastValue = null;
};
VisibilityControl.prototype = Object.create(ModelControl.prototype);
VisibilityControl.prototype.constructor = VisibilityControl;
VisibilityControl.prototype._controlType = "VISIBILITY";
/**
 * @param {Object} jsonData
 * @override
 */
VisibilityControl.prototype.setFromJson = function (jsonData) {
    ModelControl.prototype.setFromJson.call(this, jsonData);
    this._dofNames.push(jsonData.dofName);
    this._meshNames = jsonData.meshNames;
};
/**
 * @param {Object.<string, THREE.Object3D>} modelMap
 * @return {!boolean}
 * @override
 */
VisibilityControl.prototype.attachToModel = function (modelMap) {
    this._meshes.length = 0; //clear all meshes
    if (modelMap == null) {
        return false;
    }
    for (var meshIndex = 0; meshIndex < this._meshNames.length; meshIndex++) {
        if (modelMap.hasOwnProperty(this._meshNames[meshIndex])) {
            this._meshes.push(modelMap[this._meshNames[meshIndex]]);
        }
        else {
            return false;
        }
    }
    return true;
};
/**
 * @param {number} dofValue
 * @return {!boolean}
 */
function updateFromDOFVal(dofValue) {
    if (dofValue !== this._lastValue) {
        this._lastValue = dofValue;
        if (typeof (dofValue) === "number") {
            for (var meshIndex = 0; meshIndex < this._meshes.length; meshIndex++) {
                this._meshes[meshIndex].visible = (dofValue !== 0);
            }
            return true;
        }
        else {
            slog.error("VisibilityControl for DOF " + this._dofNames[0] + ": expected numerical value, but got: " + dofValue);
            return false;
        }
    }
}
/**
 * @param {Object.<string, Object>} dofValues
 * @return {!boolean}
 * @override
 */
VisibilityControl.prototype.updateFromDOFValues = function (dofValues) {
    if (this._meshes.length > 0 && dofValues.hasOwnProperty(this._dofNames[0])) {
        var dofValue = dofValues[this._dofNames[0]];
        return updateFromDOFVal.call(this, dofValue);
    }
    else {
        return false;
    }
};
/**
 * @param {Pose} pose
 * @return {!boolean}
 * @override
 */
VisibilityControl.prototype.updateFromPose = function (pose) {
    var dofValue = pose.get(this._dofNames[0], 0);
    if (this._meshes.length > 0 && (dofValue != null)) {
        return updateFromDOFVal.call(this, dofValue);
    }
    else {
        return false;
    }
};
/**
 * Creates a copy of this dof, or fills in this dof's data to the provided
 * argument (to allow type to be defined by subclass's getCopy).
 *
 * @param {VisibilityControl} copyInto - optional object to copy into
 * @return {VisibilityControl} copy of this dof, not attached to any model
 * @override
 */
VisibilityControl.prototype.getCopy = function (copyInto) {
    if (!copyInto) {
        copyInto = new VisibilityControl();
    }
    ModelControl.prototype.getCopy.call(this, copyInto);
    copyInto._meshNames = this._meshNames ? this._meshNames.slice(0) : null;
    return copyInto;
};
/**
 * @constructor
 */
VisibilityControl.Factory = function () {
};
VisibilityControl.Factory.prototype = Object.create(ModelControlFactory.prototype);
VisibilityControl.Factory.prototype.constructor = VisibilityControl.Factory;
VisibilityControl.Factory.prototype._controlType = VisibilityControl.prototype._controlType;
VisibilityControl.Factory.prototype._controlConstructor = VisibilityControl;
module.exports = VisibilityControl;

},{"../../ifr-core/SLog":57,"./ModelControl":85,"./ModelControlFactory":86}],92:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Bakery = require("../../ifr-core/Bakery");
var CyclicMath = require("../base/CyclicMath");
var PController = function () {
    /** @type {Time} */
    this._targetTime = null;
    /** @type {number} */
    this._targetPosition = null;
    /** @type {number} */
    this._targetVelocity = null;
    /** @type {Time} */
    this._lastObservationTime = null;
    /** @type {number} */
    this._lastObservedPosition = null;
    /** @type {number} */
    this._lastObservedVelocity = null;
    /** @type {number} */
    this._lastReportedTargetVelocity = null;
    /** @type {number} */
    this._commandVelocity = 0;
    /** @type {number} */
    this._commandAcceleration = 1;
    /** @type {number} */
    this._lastError = 0;
    this._window = "FeedbackController";
};
PController.prototype.setTarget = function (time, position, velocity) {
    this._targetTime = time;
    this._targetPosition = position;
    this._targetVelocity = velocity;
};
PController.prototype.acceptFeedback = function (receivedTime, measuredPosition, measuredVelocity, targetVelocity) {
    this._lastObservationTime = receivedTime;
    this._lastObservedPosition = measuredPosition;
    this._lastObservedVelocity = measuredVelocity;
    this._lastReportedTargetVelocity = targetVelocity;
};
/**
 *
 * @param {Time} time
 */
PController.prototype.calculateForTime = function (time) {
    if (this._lastObservationTime !== null && this._targetTime !== null) {
        var targetElapsed = time.subtract(this._targetTime);
        var currentTarget = this._targetPosition + this._targetVelocity * targetElapsed;
        var pGain = Bakery.getFloat("P Gain", 0, 10, 2, this._window);
        var dGain = Bakery.getFloat("D Gain", 0, 10, 0, this._window);
        var useActual = this.predictedPosition(time);
        useActual = CyclicMath.closestEquivalentRotation(useActual, currentTarget);
        var error = currentTarget - useActual;
        var dError = error - this._lastError;
        var commandVelocity = pGain * error + dGain * dError;
        this._lastError = error;
        var maxVel = Bakery.getFloat("P Gain Vel Cap", 0, 100, 100, this._window);
        commandVelocity = Math.max(-maxVel, Math.min(maxVel, commandVelocity));
        this._commandVelocity = commandVelocity;
        this._commandAcceleration = Bakery.getFloat("Advertise Accel Limit", 0, 50, 30, this._window);
    }
};
/**
 *
 * @param {Time} time
 */
PController.prototype.predictedPosition = function (time) {
    return this._lastObservedPosition; //TODO
};
PController.prototype.getCommandVelocity = function () {
    return this._commandVelocity;
};
PController.prototype.getCommandAcceleration = function () {
    return this._commandAcceleration;
};
/**
 *
 * @param {Time} timeSent
 * @param {number} commandVelocity
 * @param {number} velocityLimit
 */
PController.prototype.noteCommandSent = function (timeSent, commandVelocity, velocityLimit) {
    //TODO
};
module.exports = PController;

},{"../../ifr-core/Bakery":52,"../base/CyclicMath":70}],93:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Bakery = require("../../ifr-core/Bakery");
var PController = require("./PController");
/**
 *
 * @constructor
 * @extends PController
 */
var PVController = function () {
    PController.call(this);
    /** @type {number} */
    this._commandVelocityPVC = 0;
};
PVController.prototype = Object.create(PController.prototype);
PVController.prototype.constructor = PVController;
/**
 * @param {Time} time
 * @override
 */
PVController.prototype.calculateForTime = function (time) {
    if (this._lastObservationTime !== null && this._targetTime !== null) {
        PController.prototype.calculateForTime.call(this, time);
        if (Bakery.getBoolean("Use Velocity", true, this._window)) {
            this._commandVelocityPVC = this._commandVelocity + this._targetVelocity;
        }
        else {
            this._commandVelocityPVC = this._commandVelocity;
        }
    }
};
/**
 * @override
 * @returns {number}
 */
PVController.prototype.getCommandVelocity = function () {
    return this._commandVelocityPVC;
};
module.exports = PVController;

},{"../../ifr-core/Bakery":52,"./PController":92}],94:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var TrajectoryControllerSim = require("./TrajectoryControllerSim");
/**
 *
 * All arguments optional. Initial position/velocity can be provided here.
 * If this plan is sampled before any updateCommand's are issued, it will
 * be traveling at initialVelocity from initialPosition with zero acceleration.
 *
 * @param {number} [initialPosition] - defaults to 0
 * @param {number} [initialVelocity] - defaults to 0
 * @param {Time} [initialTime] - defaults to current time
 * @constructor
 * @extends TrajectoryControllerSim
 */
var PosVelControllerSim = function (initialPosition, initialVelocity, initialTime) {
    TrajectoryControllerSim.call(this, initialPosition, initialVelocity, initialTime);
};
PosVelControllerSim.prototype = Object.create(TrajectoryControllerSim.prototype);
PosVelControllerSim.prototype.constructor = PosVelControllerSim;
/**
 *
 * @param {number} targetPosition
 * @param {number} targetVelocity
 * @param {number} maxAcceleration
 * @param {number} maxVelocity
 * @param {Time} [currentTime] - time to activate command (current time used if omitted)
 * @override
 */
PosVelControllerSim.prototype.updateCommand = function (targetPosition, targetVelocity, maxAcceleration, maxVelocity, currentTime) {
    var interceptInSeconds = 0.1;
    TrajectoryControllerSim.prototype.updateCommand.call(this, targetPosition, targetVelocity, interceptInSeconds, maxAcceleration, maxVelocity, currentTime);
};
module.exports = PosVelControllerSim;

},{"./TrajectoryControllerSim":95}],95:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var AccelPlanner = require("../base/AccelPlanner");
var Clock = require("../../ifr-core/Clock");
var CyclicMath = require("../base/CyclicMath");
var slog = require("../../ifr-core/SLog");
/**
 *
 * All arguments optional. Initial position/velocity can be provided here.
 * If this plan is sampled before any updateCommand's are issued, it will
 * be traveling at initialVelocity from initialPosition with zero acceleration.
 *
 * @param {number} [initialPosition] - defaults to 0
 * @param {number} [initialVelocity] - defaults to 0
 * @param {Time} [initialTime] - defaults to current time
 * @constructor
 */
var TrajectoryControllerSim = function (initialPosition, initialVelocity, initialTime) {
    if (initialPosition == null) {
        initialPosition = 0;
    }
    if (initialVelocity == null) {
        initialVelocity = 0;
    }
    if (initialTime == null) {
        initialTime = Clock.currentTime();
    }
    /** @type {AccelPlanner} */
    this._planner = new AccelPlanner();
    /** @type {AccelPlan} */
    this._plan = this._planner.computeWithZeroAccel(initialVelocity);
    /** @type {Time} */
    this._planStartTime = initialTime;
    /** @type {number} */
    this._planStartPosition = initialPosition;
};
/**
 *
 * @param {number} targetPosition
 * @param {number} targetVelocity
 * @param {number} interceptInSeconds
 * @param {number} maxAcceleration
 * @param {number} maxVelocity
 * @param {Time} [currentTime] - time to activate command (current time used if omitted)
 */
TrajectoryControllerSim.prototype.updateCommand = function (targetPosition, targetVelocity, interceptInSeconds, maxAcceleration, maxVelocity, currentTime) {
    if (currentTime == null) {
        currentTime = Clock.currentTime();
    }
    var tDelta = currentTime.subtract(this._planStartTime);
    var currentPosition = this._plan.displacementAtTime(tDelta) + this._planStartPosition;
    var currentVelocity = this._plan.velocityAtTime(tDelta);
    targetPosition = CyclicMath.closestEquivalentRotation(targetPosition, currentPosition);
    this._plan = this._planner.computeWithMaxAccel(currentVelocity, targetVelocity, targetPosition - currentPosition, maxAcceleration, interceptInSeconds);
    if (!this._plan.isConsistent()) {
        slog.error("Inconsistent plan with inputs: " +
            "\n\tcurrentVelocity:" + currentVelocity + " " +
            "\n\ttargetVelocity:" + targetVelocity + " " +
            "\n\tpDelta:" + (targetPosition - currentPosition) + " " +
            "\n\tmaxAcceleration:" + maxAcceleration + " " +
            "\n\tmaxVelocity:" + maxVelocity);
        this.plan = this._planner.computeWithMaxAccel(0, 0, 0, 1, 1);
    }
    this._planStartTime = currentTime;
    this._planStartPosition = currentPosition;
};
/**
 * @param {Time} [currentTime] - time at which to get position (current time used if omitted)
 * @return {number}
 */
TrajectoryControllerSim.prototype.getPosition = function (currentTime) {
    if (currentTime == null) {
        currentTime = Clock.currentTime();
    }
    var tDelta = currentTime.subtract(this._planStartTime);
    var currentPosition = this._plan.displacementAtTime(tDelta) + this._planStartPosition;
    return currentPosition;
};
/**
 * @param {Time} [currentTime] - time at which to get velocity (current time used if omitted)
 * @return {number}
 */
TrajectoryControllerSim.prototype.getVelocity = function (currentTime) {
    if (currentTime == null) {
        currentTime = Clock.currentTime();
    }
    var tDelta = currentTime.subtract(this._planStartTime);
    var currentVelocity = this._plan.velocityAtTime(tDelta);
    return currentVelocity;
};
module.exports = TrajectoryControllerSim;

},{"../../ifr-core/Clock":53,"../../ifr-core/SLog":57,"../base/AccelPlanner":67,"../base/CyclicMath":70}],96:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var TimestampedBuffer = require("../base/TimestampedBuffer");
var MotionTrack = require("../base/MotionTrack");
var Motion = require("../base/Motion");
var MotionEvent = require("../base/MotionEvent");
var FileTools = require("../../ifr-core/FileTools");
var slog = require("../../ifr-core/SLog");
let { PathUtils } = require('jibo-plugins');
var channel = "MODEL_LOADING";
/**
 * @constructor
 */
var AnimationLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {Motion} */
    this.motion = null;
    /** @type {Array.<string>} */
    this.defaultDOFNames = null;
    /** @type {Object.<string, Object.<number, string>>} */
    this.enumMaps = null;
    /** @type {MotionEvent[]} */
    this.events = null;
};
/**
 * @constructor
 */
var AnimationLoader = function () {
    /** @type {AnimationLoadResult} */
    this._result = null;
    /** @type {boolean} */
    this.flattenEnums = true;
    /** @type {boolean} */
    this.resolvePaths = true;
};
/**
 * @return {AnimationLoadResult}
 */
AnimationLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
AnimationLoader.prototype.load = function (url, callback) {
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data, url);
            if (callback) {
                callback();
            }
        }
        else {
            var result = new AnimationLoadResult();
            result.url = url;
            result.success = false;
            result.message = error;
            self._result = result;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @param {string} dataUrl
 */
AnimationLoader.prototype.parseData = function (jsonData, dataUrl) {
    this._result = new AnimationLoadResult();
    this._result.url = dataUrl;
    if (jsonData.header.fileType !== "DOFAnimation" && jsonData.header.fileType !== "Animation") {
        this._result.success = false;
        this._result.message = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    var animContent = jsonData.content;
    var motion = new Motion(animContent.name);
    for (var channelIndex = 0; channelIndex < animContent.channels.length; channelIndex++) {
        var channelData = animContent.channels[channelIndex];
        var sampleBuffer = new TimestampedBuffer();
        sampleBuffer.timestampList = channelData.times;
        sampleBuffer.dataList = channelData.values;
        var track = new MotionTrack(channelData.dofName, sampleBuffer, channelData.length);
        motion.addTrack(track);
    }
    this._result.motion = motion;
    if (animContent.defaultDOFs) {
        this._result.defaultDOFNames = animContent.defaultDOFs;
    }
    if (animContent.enumMaps) {
        this._result.enumMaps = {};
        for (var mapIndex = 0; mapIndex < animContent.enumMaps.length; mapIndex++) {
            var enumMapData = animContent.enumMaps[mapIndex];
            this._result.enumMaps[enumMapData.dofName] = enumMapData.values;
        }
        if (this.flattenEnums) {
            flattenEnums(this._result.motion, this._result.enumMaps);
        }
    }
    if (this.resolvePaths) {
        resolvePaths(this._result.motion, dataUrl);
    }
    if (animContent.events) {
        this._result.events = [];
        for (var eventIndex = 0; eventIndex < animContent.events.length; eventIndex++) {
            var eventData = animContent.events[eventIndex];
            if (eventData.time === undefined || eventData.time === null) {
                slog(channel, "AnimationLoader: skipping event with null or undefined time property");
            }
            else if (eventData.time < 0 || eventData.time > motion.getDuration()) {
                slog(channel, "AnimationLoader: skipping event with time property: " + eventData.time + " outside of animation bounds, animation duration = " + motion.getDuration());
            }
            else if (eventData.eventName === undefined || eventData.eventName === null || eventData.eventName === "") {
                slog(channel, "AnimationLoader: skipping event with empty, null, or undefined eventName property");
            }
            else if (typeof (eventData.eventName) !== "string") {
                slog(channel, "AnimationLoader: skipping event with non-string eventName property: " + eventData.eventName);
            }
            else {
                // event data ok!
                var payload = (eventData.payload !== undefined) ? eventData.payload : null;
                this._result.events.push(new MotionEvent(eventData.time, eventData.eventName, payload));
            }
        }
        // sort events by timestamp
        this._result.events.sort(function (eventA, eventB) {
            return eventA.getTimestamp() - eventB.getTimestamp();
        });
    }
    this._result.success = true;
};
/**
 * @param {Motion} motion
 * @param {Object.<string, Object.<number, string>>} enumMaps
 */
var flattenEnums = function (motion, enumMaps) {
    var tracks = motion.getTracks();
    var dofs = Object.keys(tracks);
    for (var dofIndex = 0; dofIndex < dofs.length; dofIndex++) {
        var dofName = dofs[dofIndex];
        if (enumMaps.hasOwnProperty(dofName)) {
            var samples = tracks[dofName].getMotionData().dataList;
            var enumMap = enumMaps[dofName];
            for (var sampleIndex = 0; sampleIndex < samples.length; sampleIndex++) {
                var sample = samples[sampleIndex];
                if (sample instanceof Array) {
                    sample = sample[0];
                }
                if (typeof (sample) === "number") {
                    var enumKey = Math.round(sample);
                    samples[sampleIndex] = [enumMap[enumKey]];
                    if (!enumMap.hasOwnProperty(enumKey)) {
                        slog(channel, "AnimationLoader: no enum value specified for key: " + enumKey + ", DOF = " + dofName);
                    }
                }
                else {
                    slog(channel, "AnimationLoader: DOF " + dofName + " has an enum map, but found non-numerical value: " + sample);
                }
            }
        }
    }
};
/**
 * @param {Motion} motion
 * @param {string} dataUrl
 */
var resolvePaths = function (motion, dataUrl) {
    var parentDir = "";
    var slashIndex = dataUrl.lastIndexOf('/');
    var backslashIndex = dataUrl.lastIndexOf('\\');
    if (slashIndex !== -1 || backslashIndex !== -1) {
        var lastIndex = Math.max(slashIndex, backslashIndex);
        parentDir = dataUrl.substring(0, lastIndex + 1);
    }
    var tracks = motion.getTracks();
    var dofs = Object.keys(tracks);
    for (var dofIndex = 0; dofIndex < dofs.length; dofIndex++) {
        var dofName = dofs[dofIndex];
        var samples = tracks[dofName].getMotionData().dataList;
        var alreadyProcessedObjects = [];
        var firstSample = samples[0];
        if (firstSample instanceof Array) {
            firstSample = firstSample[0];
        }
        //animation-utilities expects samples to be Nan but when you transmit an
        //anim data object over the wire it goes through a JSON.stringify and JSON.parse.
        //JSON.parse(JSON.stringify(NaN)) is the value `null`, which makes the following
        //statement evaluate to true `typeof(null) === "object"`. So if a sample is `null`
        //then just change it to NaN so this code won't break
        if (firstSample === null) {
            firstSample = NaN;
        }
        if (typeof (firstSample) === "string" || typeof (firstSample) === "object") {
            // string/object valued samples!
            for (var sampleIndex = 0; sampleIndex < samples.length; sampleIndex++) {
                var sample = samples[sampleIndex];
                if (sample instanceof Array) {
                    sample = sample[0];
                }
                if (typeof (sample) === "string") {
                    try {
                        samples[sampleIndex] = [PathUtils.getAssetUri(sample, '', parentDir)];
                    }
                    catch (e) {
                        console.error('Could not find sample ' + sample + ' : ' + parentDir);
                    }
                }
                else if (typeof (sample) === "object") {
                    //only object we have is a texture+normal object
                    //process url or textureURL (and normalURL if present)
                    if (alreadyProcessedObjects.indexOf(sample) < 0) {
                        if (typeof (sample.textureURL) === "string") {
                            sample.textureURL = PathUtils.getAssetUri(sample.textureURL, '', parentDir);
                            if (typeof (sample.normalURL) === "string") {
                                sample.normalURL = PathUtils.getAssetUri(sample.normalURL, '', parentDir);
                            }
                            alreadyProcessedObjects.push(sample);
                        }
                        else {
                            slog(channel, "AnimationLoader: DOF " + dofName + " had object-valued samples, but at least one (" + sampleIndex + ") is missing \"textureURL\" field");
                        }
                    }
                }
                else {
                    slog(channel, "AnimationLoader: DOF " + dofName + " had string-valued samples, but also found non-string value: " + sample);
                }
            }
        }
    }
};
module.exports = AnimationLoader;

},{"../../ifr-core/FileTools":54,"../../ifr-core/SLog":57,"../base/Motion":74,"../base/MotionEvent":75,"../base/MotionTrack":77,"../base/TimestampedBuffer":81,"jibo-plugins":undefined}],97:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var ModelControlGroup = require("../dofs/ModelControlGroup");
var RotationControl = require("../dofs/RotationControl");
var TranslationControl = require("../dofs/TranslationControl");
var TextureControl = require("../dofs/TextureControl");
var ColorControl = require("../dofs/ColorControl");
var VisibilityControl = require("../dofs/VisibilityControl");
var FileTools = require("../../ifr-core/FileTools");
/**
 * @constructor
 */
var KinematicsLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {ModelControlGroup} */
    this.modelControlGroup = null;
};
/**
 * @constructor
 */
var KinematicsLoader = function () {
    /** @type {KinematicsLoadResult} */
    this._result = null;
    /** @type {Object.<string, ModelControlFactory>} */
    this._modelControlFactoryMap = {};
    // add default model controls
    this.addModelControlFactory(new RotationControl.Factory());
    this.addModelControlFactory(new TranslationControl.Factory());
    this.addModelControlFactory(new TextureControl.Factory());
    this.addModelControlFactory(new ColorControl.Factory());
    this.addModelControlFactory(new VisibilityControl.Factory());
};
/**
 * @param {ModelControlFactory} modelControlFactory
 */
KinematicsLoader.prototype.addModelControlFactory = function (modelControlFactory) {
    this._modelControlFactoryMap[modelControlFactory.getControlType()] = modelControlFactory;
};
/**
 * @param {string} controlType
 * @return {ModelControlFactory}
 */
KinematicsLoader.prototype.getModelControlFactory = function (controlType) {
    return this._modelControlFactoryMap[controlType];
};
/**
 * @return {KinematicsLoadResult}
 */
KinematicsLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
KinematicsLoader.prototype.load = function (url, callback) {
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data, url);
            if (callback) {
                callback();
            }
        }
        else {
            var result = new KinematicsLoadResult();
            result.url = url;
            result.success = false;
            result.message = error;
            self._result = result;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @param {string} dataUrl
 */
KinematicsLoader.prototype.parseData = function (jsonData, dataUrl) {
    this._result = new KinematicsLoadResult();
    this._result.url = dataUrl;
    if (jsonData.header.fileType !== "Kinematics") {
        this._result.success = false;
        this._result.message = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    /** @type Array.<ModelControl> */
    var controlList = [];
    for (var controlIndex = 0; controlIndex < jsonData.content.controls.length; controlIndex++) {
        var controlData = jsonData.content.controls[controlIndex];
        if (!this._modelControlFactoryMap.hasOwnProperty(controlData.controlType)) {
            this._result.success = false;
            this._result.message = "no factory installed for control type: " + controlData.controlType + ", control name = " + controlData.controlName;
            return;
        }
        else {
            var factory = this._modelControlFactoryMap[controlData.controlType];
            var control = factory.constructFromJson(controlData);
            if (control === null) {
                this._result.success = false;
                this._result.message = "factory construction failed, control type = " + controlData.controlType + ", control name = " + controlData.controlName;
                return;
            }
            else {
                controlList.push(control);
            }
        }
    }
    var controlTypes = Object.keys(this._modelControlFactoryMap);
    for (var typeIndex = 0; typeIndex < controlTypes.length; typeIndex++) {
        controlList = this._modelControlFactoryMap[controlTypes[typeIndex]].postProcessControlList(controlList);
    }
    this._result.modelControlGroup = new ModelControlGroup();
    this._result.modelControlGroup.setControlList(controlList);
    this._result.success = true;
};
module.exports = KinematicsLoader;

},{"../../ifr-core/FileTools":54,"../dofs/ColorControl":82,"../dofs/ModelControlGroup":87,"../dofs/RotationControl":88,"../dofs/TextureControl":89,"../dofs/TranslationControl":90,"../dofs/VisibilityControl":91}],98:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var FileTools = require("../../ifr-core/FileTools");
var slog = require("../../ifr-core/SLog");
var channel = "MODEL_LOADING";
/**
 * @constructor
 */
var LimitsLoadResult = function () {
    /** @type {string} */
    this.url = null;
    /** @type {!boolean} */
    this.success = false;
    /** @type {string} */
    this.message = "";
    /** @type {Object.<string, Object>} */
    this.dofLimits = null;
};
/**
 * @constructor
 */
var LimitsLoader = function () {
    /** @type {LimitsLoadResult} */
    this._result = null;
};
/**
 * @return {LimitsLoadResult}
 */
LimitsLoader.prototype.getResult = function () {
    return this._result;
};
/**
 * @param {string} url
 * @param callback
 */
LimitsLoader.prototype.load = function (url, callback) {
    var self = this;
    FileTools.loadJSON(url, function (error, data) {
        if (error === null) {
            self.parseData(data, url);
            if (callback) {
                callback();
            }
        }
        else {
            var result = new LimitsLoadResult();
            result.url = url;
            result.success = false;
            result.message = error;
            self._result = result;
            if (callback) {
                callback();
            }
        }
    });
};
/**
 * @param {Object} jsonData
 * @param {string} dataUrl
 */
LimitsLoader.prototype.parseData = function (jsonData, dataUrl) {
    this._result = new LimitsLoadResult();
    this._result.url = dataUrl;
    if (jsonData.header.fileType !== "Limits") {
        this._result.success = false;
        this._result.message = "don't know how to handle file type: " + jsonData.header.fileType;
        return;
    }
    /** @type {Object.<string, Object>} */
    var dofLimits = {};
    var limitsList = jsonData.content.dofLimits;
    if (limitsList) {
        for (var i = 0; i < limitsList.length; i++) {
            var dofName = limitsList[i].dofName;
            var limitData = limitsList[i].limits;
            if (dofName === undefined || dofName === null) {
                slog(channel, "LimitsLoader: skipping limit data with null or undefined dofName property");
            }
            else if (limitData === undefined || limitData === null) {
                slog(channel, "LimitsLoader: skipping limit data with null or undefined limits property");
            }
            else {
                // limit data ok!
                dofLimits[dofName] = limitData;
            }
        }
    }
    this._result.dofLimits = dofLimits;
    this._result.success = true;
};
module.exports = LimitsLoader;

},{"../../ifr-core/FileTools":54,"../../ifr-core/SLog":57}],99:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2017 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var ConeMath = function () {
};
/**
 * Cone1 and cone2 are cones with the same origin; if they intersect, their intersections will be 1 or 2 (or infinite)
 * rays from that same origin.  Consider the plane on which both cone1Axis and cone2Axis lie.
 * If cone1 and cone2 intersect, both intersections will project down to the same line on that plane (or,
 * there may be a single intersection, which will already lie on the plane).  This function finds the on-plane
 * projection of the intersection(s) between the cones.  It describes that intersection by the angle from cone1Axis
 * to that intersection ray projection, with positive angles moving in the direction towards cone1Axis.
 *
 * Behavior not defined if there is no solution or infinite solutions (equal plane axes and angles).
 *
 * @param {number} angleBetweenCones - the angle between the cone axes (positive number)
 * @param {number} cone1Angle - angle from the cone central axis to the cone walls for cone1
 * @param {number} cone2Angle - angle from the cone central axis to the cone walls for cone2
 * @returns {number} the angle from cone1 axis to the projection of the intersection of the cones (positive angles in the direction of cone2 axis)
 */
ConeMath.prototype.flatConeIntersection = function (angleBetweenCones, cone1Angle, cone2Angle) {
    //
    //  Strategy:
    //  This solution is based on the strategy of defining the height of each cone off their shared plane
    //  for every angle "a" around the plane normal starting with a=0 at plane1 axis.  When both cones
    //  have the same height above the plane at a given a, that is the intersection.
    //
    //  This yields the following equation: ( (k*cos(a))^2 - (sin(a))^2 ) ^0.5 = ( (l*cos(a-d))^2 - (sin(a-d))^2 ) ^0.5, solve for a
    //  k = ratio 1 cone grows at (relative to distance from origin), e.g. radius = k*height, or angle = atan(k)
    //  l = ratio other cone grows at
    //  d = angular distance between cone axes
    //  a = angle from cone 1 axis along plane defined by the 2 cones' normals
    //
    //this version of the solution only works for positive answer cases; swap cone1Angle to be the larger if it isn't,
    // if cone1 is the larger cone we cannot get negative answers.
    var swapped;
    var k, l;
    if (cone1Angle >= cone2Angle) {
        swapped = false;
        k = Math.tan(cone1Angle);
        l = Math.tan(cone2Angle);
    }
    else {
        swapped = true;
        k = Math.tan(cone2Angle);
        l = Math.tan(cone1Angle);
    }
    var d = angleBetweenCones;
    var Q = Math.cos(2 * d);
    var kk = k * k;
    var ll = l * l;
    var T = 2 * (-kk * ll * Q - kk * Q - ll * Q - Q + kk + ll + 1) + ll * ll + kk * kk;
    var a = Math.acos(Math.sqrt((-(ll * ll * Q) + ll * ll + (kk * ll) - (kk * ll * Q) - (3 * ll * Q) + (3 * ll) + kk - (kk * Q) - (2 * Q) + 2 +
        (4 * Math.pow(Math.sin(d), 2) * Math.cos(d) * Math.sqrt((kk + 1) * Math.pow((ll + 1), 3)))) /
        (2 * T)));
    if (swapped) {
        return angleBetweenCones - a;
    }
    else {
        return a;
    }
};
/**
 * Cone1 and cone2 are cones with the same origin; if they intersect, their intersections will be 1 or 2 (or infinite)
 * rays from that same origin.  In case where there are 2 intersections, this function finds one of those intersections.
 * Behavior is undefined in the 0, 1, or infinite intersection cases.
 *
 * @param {THREE.Vector3} cone1Axis - central axis of cone1, normalized, pointing the direction of increasing radius
 * @param {THREE.Vector3} cone2Axis - central axis of cone2, normalized, pointing the direction of increasing radius
 * @param {number} cone1Angle - angle from the cone central axis to the cone walls for cone1
 * @param {number} cone2Angle - angle from the cone central axis to the cone walls for cone2
 * @param {THREE.Vector3} [inplaceVec] - optional, solution will be placed here if present
 * @return {THREE.Vector3} a vector representing an intersection line of the 2 cones (will be inplaceVec if provided)
 */
ConeMath.prototype.sharedOriginConeIntersection = function (cone1Axis, cone2Axis, cone1Angle, cone2Angle, inplaceVec) {
    //
    //  Strategy:
    //  Solution based on choosing a vector that has the appropriate angle to both axes; that is,
    //  a solution T would have "angleBetween T and cone1Axis = cone1Angle, angleBetween T and cone2Axis = cone2Angle".
    //  Using a dot-product strategy:
    //  	Angle between 2 vectors is normally acos( (v1 dot v2) / (|v1|*|v2|) )
    //  	Here our axes are normalized, and we'll define constants for the cosine of our target angles, so we can use a simplified:
    //  	cosMyAngle = v1 dot v2
    //
    //   x,y,z is T, intersection ray (normalized)
    //   a,b,c is cone1 axis (normalized)
    //   d,e,f is cone2 axis (normalized)
    //   v = cos(cone1Angle)
    //   w = cos(cone2Angle)
    //
    //  	//sage format
    //  	solve([x*a+y*b+z*c==v, x*d+y*e+z*f==w, x^2+y^2+z^2==1, d^2+e^2+f^1==1, a^2+b^2+c^2==1],x,y,z)
    //
    var a = cone1Axis.x;
    var b = cone1Axis.y;
    var c = cone1Axis.z;
    var d = cone2Axis.x;
    var e = cone2Axis.y;
    var f = cone2Axis.z;
    var aa = a * a;
    var bb = b * b;
    var cc = c * c;
    var dd = d * d;
    var ee = e * e;
    var ff = f * f;
    var v = Math.cos(cone1Angle);
    var w = Math.cos(cone2Angle);
    var vv = v * v;
    var ww = w * w;
    var x1 = ((c * d * f - a * ff + b * d * e - a * ee) * v + (a * c * f + a * b * e - (bb + cc) * d) * w - Math.sqrt(-2 * a * b * d * e + (bb + cc) * dd + (aa + bb) * ff - (dd + ff + ee) * vv + 2 * (a * d + c * f + b * e) * v * w - (aa + bb + cc) * ww + aa * ee + cc * ee - 2 * (a * c * d + b * c * e) * f) * (b * f - c * e)) / (2 * a * b * d * e - (bb + cc) * dd - (aa + bb) * ff - aa * ee - cc * ee + 2 * (a * c * d + b * c * e) * f);
    var y1 = -(Math.sqrt(bb * dd + cc * dd - 2 * a * c * d * f + aa * ff + bb * ff - dd * vv - ff * vv + 2 * a * d * v * w + 2 * c * f * v * w - aa * ww - bb * ww - cc * ww - 2 * a * b * d * e - 2 * b * c * f * e + 2 * b * v * w * e + aa * ee + cc * ee - vv * ee) * c * d - Math.sqrt(bb * dd + cc * dd - 2 * a * c * d * f + aa * ff + bb * ff - dd * vv - ff * vv + 2 * a * d * v * w + 2 * c * f * v * w - aa * ww - bb * ww - cc * ww - 2 * a * b * d * e - 2 * b * c * f * e + 2 * b * v * w * e + aa * ee + cc * ee - vv * ee) * a * f + (b * dd + b * ff - a * d * e - c * f * e) * v - (a * b * d + b * c * f - aa * e - cc * e) * w) / (2 * a * b * d * e - (bb + cc) * dd - (aa + bb) * ff - aa * ee - cc * ee + 2 * (a * c * d + b * c * e) * f);
    var z1 = (Math.sqrt(bb * dd + cc * dd - 2 * a * c * d * f + aa * ff + bb * ff - dd * vv - ff * vv + 2 * a * d * v * w + 2 * c * f * v * w - aa * ww - bb * ww - cc * ww - 2 * a * b * d * e - 2 * b * c * f * e + 2 * b * v * w * e + aa * ee + cc * ee - vv * ee) * b * d - Math.sqrt(bb * dd + cc * dd - 2 * a * c * d * f + aa * ff + bb * ff - dd * vv - ff * vv + 2 * a * d * v * w + 2 * c * f * v * w - aa * ww - bb * ww - cc * ww - 2 * a * b * d * e - 2 * b * c * f * e + 2 * b * v * w * e + aa * ee + cc * ee - vv * ee) * a * e - (c * dd - (a * d + b * e) * f + c * ee) * v + (a * c * d + b * c * e - (aa + bb) * f) * w) / (2 * a * b * d * e - (bb + cc) * dd - (aa + bb) * ff - aa * ee - cc * ee + 2 * (a * c * d + b * c * e) * f);
    //var x2 = ((c*d*f - a*ff + b*d*e - a*ee)*v + (a*c*f + a*b*e - (bb + cc)*d)*w + Math.sqrt(-2*a*b*d*e + (bb + cc)*dd + (aa + bb)*ff - (dd + ff + ee)*vv + 2*(a*d + c*f + b*e)*v*w - (aa + bb + cc)*ww + aa*ee + cc*ee - 2*(a*c*d + b*c*e)*f)*(b*f - c*e))/(2*a*b*d*e - (bb + cc)*dd - (aa + bb)*ff - aa*ee - cc*ee + 2*(a*c*d + b*c*e)*f);
    //var y2 = (Math.sqrt(bb*dd + cc*dd - 2*a*c*d*f + aa*ff + bb*ff - dd*vv - ff*vv + 2*a*d*v*w + 2*c*f*v*w - aa*ww - bb*ww - cc*ww - 2*a*b*d*e - 2*b*c*f*e + 2*b*v*w*e + aa*ee + cc*ee - vv*ee)*c*d - Math.sqrt(bb*dd + cc*dd - 2*a*c*d*f + aa*ff + bb*ff - dd*vv - ff*vv + 2*a*d*v*w + 2*c*f*v*w - aa*ww - bb*ww - cc*ww - 2*a*b*d*e - 2*b*c*f*e + 2*b*v*w*e + aa*ee + cc*ee - vv*ee)*a*f - (b*dd + b*ff - a*d*e - c*f*e)*v + (a*b*d + b*c*f - aa*e - cc*e)*w)/(2*a*b*d*e - (bb + cc)*dd - (aa + bb)*ff - aa*ee - cc*ee + 2*(a*c*d + b*c*e)*f);
    //var z2 = -(Math.sqrt(bb*dd + cc*dd - 2*a*c*d*f + aa*ff + bb*ff - dd*vv - ff*vv + 2*a*d*v*w + 2*c*f*v*w - aa*ww - bb*ww - cc*ww - 2*a*b*d*e - 2*b*c*f*e + 2*b*v*w*e + aa*ee + cc*ee - vv*ee)*b*d - Math.sqrt(bb*dd + cc*dd - 2*a*c*d*f + aa*ff + bb*ff - dd*vv - ff*vv + 2*a*d*v*w + 2*c*f*v*w - aa*ww - bb*ww - cc*ww - 2*a*b*d*e - 2*b*c*f*e + 2*b*v*w*e + aa*ee + cc*ee - vv*ee)*a*e + (c*dd - (a*d + b*e)*f + c*ee)*v - (a*c*d + b*c*e - (aa + bb)*f)*w)/(2*a*b*d*e - (bb + cc)*dd - (aa + bb)*ff - aa*ee - cc*ee + 2*(a*c*d + b*c*e)*f);
    if (inplaceVec != null) {
        inplaceVec.set(x1, y1, z1);
    }
    else {
        inplaceVec = new THREE.Vector3(x1, y1, z1);
    }
    return inplaceVec;
};
/**
 * Cone1 and cone2 are cones with the same origin; if they intersect, their intersections will be 1 or 2 (or infinite)
 * rays from that same origin.  In case where there are 2 intersections, this function finds one of those intersections.
 * Behavior is undefined in the 0, 1, or infinite intersection cases.
 *
 * Cone1 is defined to have axis (0,0,1), and cone2 is defined to have axis (cone2AxisX, 0, cone2AxisZ); that is, it lies on the
 * "y" plane.  Any 2 cones can be rotated to this configuration without affecting their relationship, and this configuration
 * simplifies the math significantly.  Cone2 axis must be normalized.  Axes point in the direction of increasing radius.
 *
 *
 * @param {number} cone2AxisX - X value of central axis of cone2,
 * @param {number} cone2AxisZ - Z value of central axis of cone2,
 * @param {number} cone1Angle - angle from the cone central axis to the cone walls for cone1
 * @param {number} cone2Angle - angle from the cone central axis to the cone walls for cone2
 * @param {THREE.Vector3} [inplaceVec] - optional, solution will be placed here if present
 * @return {THREE.Vector3} a vector representing an intersection line of the 2 cones (will be inplaceVec if provided)
 */
ConeMath.prototype.sharedOriginConeIntersectionSimplified = function (cone2AxisX, cone2AxisZ, cone1Angle, cone2Angle, inplaceVec) {
    //strategy:
    //
    // Solution based on choosing a vector that has the appropriate angle to both axes; that is,
    // a solution T would have "angleBetween T and cone1Axis = cone1Angle, angleBetween T and cone2Axis = cone2Angle".
    // Using a dot-product strategy:
    //  	Angle between 2 vectors is normally acos( (v1 dot v2) / (|v1|*|v2|) )
    //  	Here our axes are normalized, and we'll define constants for the cosine of our target angles, so we can use a simplified:
    //  	cosMyAngle = v1 dot v2
    //
    //   x,y,z is T, intersection ray (normalized)
    //   a,b,c is cone1 axis (normalized)
    //   d,e,f is cone2 axis (normalized)
    //   v = cos(cone1Angle)
    //   w = cos(cone2Angle)
    //
    //  	//sage format
    //  	So we have
    //  	solve([x*a+y*b+z*c==v, x*d+y*e+z*f==w, x^2+y^2+z^2==1, d^2+e^2+f^1==1, a^2+b^2+c^2==1],x,y,z)
    //
    //  	However: a,b, and e = 0; c = 1; so:
    //  	 solve([z==v, x*d+z*f==w, x^2+y^2+z^2==1, d^2+f^1==1],x,y,z)
    //
    var d = cone2AxisX;
    var f = cone2AxisZ;
    var v = Math.cos(cone1Angle);
    var w = Math.cos(cone2Angle);
    var x1 = -(f * v - w) / d;
    var z1 = v;
    var y1 = Math.sqrt(1 - x1 * x1 - z1 * z1);
    //var y1 = Math.sqrt(-dd*vv - ff*vv + 2*f*v*w + dd - ww)/d;
    if (inplaceVec != null) {
        inplaceVec.set(x1, y1, z1);
    }
    else {
        inplaceVec = new THREE.Vector3(x1, y1, z1);
    }
    return inplaceVec;
};
/**
 * Cone1 and cone2 are cones with the same origin; if they intersect, their intersections will be 1 or 2 (or infinite)
 * rays from that same origin.  In case where there are 2 intersections, this function finds one of those intersections.
 * Behavior is undefined in the 0, 1, or infinite intersection cases.
 *
 * The answer is expressed as the "flat angle" of the result, e.g., the angle from cone1Axis to the projection
 * of the intersection ray on the plane defined by the two axes.  0 means the same as cone1Axis, positive
 * values move in the direction of cone2axis
 *
 *
 * @param {number} angleBetweenCones - the angle between the 2 cone axes
 * @param {number} cone1Angle - angle from the cone central axis to the cone walls for cone1
 * @param {number} cone2Angle - angle from the cone central axis to the cone walls for cone2
 * @return {number} the flat angle identifying the intersecting ray
 */
ConeMath.prototype.sharedOriginConeIntersectionAngle = function (angleBetweenCones, cone1Angle, cone2Angle) {
    //strategy:
    //
    // Solution based on choosing a vector that has the appropriate angle to both axes; that is,
    // a solution T would have "angleBetween T and cone1Axis = cone1Angle, angleBetween T and cone2Axis = cone2Angle".
    // Using a dot-product strategy:
    //  	Angle between 2 vectors is normally acos( (v1 dot v2) / (|v1|*|v2|) )
    //  	Here our axes are normalized, and we'll define constants for the cosine of our target angles, so we can use a simplified:
    //  	cosMyAngle = v1 dot v2
    //
    //   imagine cone1 at 0,0,1, cone2 a rotation around Y away.
    //   x,y,z is T, intersection ray (normalized)
    //   a,b,c is cone1 axis (normalized)
    //   d,e,f is cone2 axis (normalized)
    //   v = cos(cone1Angle)
    //   w = cos(cone2Angle)
    //
    //  	//sage format
    //  	So we have
    //  	solve([x*a+y*b+z*c==v, x*d+y*e+z*f==w, x^2+y^2+z^2==1, d^2+e^2+f^1==1, a^2+b^2+c^2==1],x,y,z)
    //
    //  	However: a,b, and e = 0; c = 1; so:
    //  	 solve([z==v, x*d+z*f==w, x^2+y^2+z^2==1, d^2+f^1==1],x,y,z)
    //
    //   However, we now don't know or care about the axis, only the differences between the two.
    //	 start by
    //   d becomes sin(angleBetweenCones)
    //   f becomes cos(angleBetweenCones)
    //
    //   we won't care about y, because we're going to project or resulting vec onto the y plane to
    //   get the flat angle
    //
    //   we want the angle from cone1Axis to projected x,y,z, ie
    //   acos( ((0,0,1) dot (x,0,z)) / (|(0,0,1)| * |(x,0,z)|))
    //   so, acos( z/sqrt(x^2 + z^2) )
    //
    //var d = cone2AxisX;
    //var f = cone2AxisZ;
    var d = Math.sin(angleBetweenCones);
    var f = Math.cos(angleBetweenCones);
    var v = Math.cos(cone1Angle);
    var w = Math.cos(cone2Angle);
    var x = -(f * v - w) / d;
    var z = v;
    //var y1 = Math.sqrt(1-x1*x1-z1*z1);
    //var y1 = Math.sqrt(-dd*vv - ff*vv + 2*f*v*w + dd - ww)/d;
    var a = Math.acos(z / Math.sqrt(x * x + z * z));
    //make sign negative if (x,y,z( cross (a,b,c) is negative y
    //since we are on the y plane, and (a,b,c) is (0,0,1), can reduce this to x < 0
    if (x < 0) {
        a = -a;
    }
    return a;
};
/**
 * Consider a cone viewed from the side, projected onto a plane that contains its central axis.
 * All of the rays that make up that cone are also projected onto this plane.  A single pair
 * of rays is identified by an angle on the plane from the cone axis to the projection of the
 * ray ("flatAngle").
 *
 * This function converts this "flatAngle" identification of the ray into an identification
 * of the ray as a rotation around the axis of the original, unprojected cone.  The zero point
 * for that around-axis rotation is defined to be the direction of +flatAngle.  That is, the zero-rotation
 * ray is the ray most in the flatAngle direction, and if that ray is rotated by by the value computed
 * here its projecting will be flatAngle from the cone axis
 *
 *
 * @param {number} flatAngle - the flat angle from cone-axis to target ray projected onto the plane
 * @param {number} coneAngle - angle from the cone central axis to the cone walls
 * @returns {number} the rotation around coneAxis to get to the ray identified by flatAngle
 */
ConeMath.prototype.flatAngleToConeRotation = function (flatAngle, coneAngle) {
    //consider rotating a perpendicular cone radius around the cone axis at height 1
    //  cone radius at height 1 would be tan(coneAngle)/1
    //  amount visible in the projected plane would be cos(rotAngle)*tan(coneAngle)
    //  so the observed projected angle flatAngle = atan(cos(rotAngle)*tan(coneAngle))
    //
    //(we project observe the projected angle formed by rotating(t) a cone1 radius at distance 1)
    //that radius at distance 1 is tan(cone1Angle/1)
    //so, invert that to get:
    var rotAngle = Math.acos(Math.tan(flatAngle) / Math.tan(coneAngle));
    return rotAngle;
};
/**
 * Operates on 2 cones with the same origin.
 * Get the around-axis rotation for each cone that would move their canonical ray
 * into the the point of intersection of the 2 cones.  The canonical ray for both
 * cones is defined as the ray most in the + direction where + is defined as the direction
 * from cone1Axis to cone2Axis.
 *
 * @param {number} angleBetweenCones - the angle between the cone axes
 * @param {number} cone1Angle - angle from the cone central axis to the cone walls for cone1
 * @param {number} cone2Angle - angle from the cone central axis to the cone walls for cone2
 * @returns {*[]} a two element array rot the around-axis rotation required for cone1 and cone2
 */
ConeMath.prototype.coneIntersectionAsDualRotations = function (angleBetweenCones, cone1Angle, cone2Angle) {
    var flatAngle = this.sharedOriginConeIntersectionAngle(angleBetweenCones, cone1Angle, cone2Angle);
    var cone1Rot = this.flatAngleToConeRotation(flatAngle, cone1Angle);
    var cone2Rot = this.flatAngleToConeRotation(flatAngle - angleBetweenCones, cone2Angle);
    return [cone1Rot, cone2Rot];
};
/**
 * Cone's origin lies on plane.  Cone has axis (0,0,1) and plane has normal
 * (planeNormalX, 0, planeNormalZ), (must be normalized).  Cone can be defined by
 * rotating a ray which is "coneAngle" from Z around the Z axis.  This function finds the ray from that
 * rotation which is perpendicular to the plane.
 *
 * In other words, this function finds the direction which is "coneAngle" from the Z axis and 0 degrees (parallel)
 * to "planeNormal".
 *
 * There are either 0, 1, 2, or infinite solutions based on the arguments; the behavior of this function is
 * defined only in the 2 solution cases, when it will return one of the two solutions.
 *
 * @param {number} coneAngle - angle from the cone central axis to the cone walls
 * @param {number} planeNormalX - x value of the plane normal
 * @param {number} planeNormalZ - y value of the plane normal
 * @param {THREE.Vector3} [inplaceVec] - optional, solution will be placed here if present
 * @return {THREE.Vector3} a vector representing an a ray on the cone perpendicular to the plane (will be inplaceVec if provided)
 */
ConeMath.prototype.sharedOriginPlaneConeIntersectionSimplified = function (coneAngle, planeNormalX, planeNormalZ, inplaceVec) {
    // strategy:
    // cone normal V, angle A
    // plane normal P
    // (plane goes through origin of cone)
    //
    // intersection ray T perp to P, and has angle A to V
    // v = cos(A)
    //  T dot P = 0
    //  T dot V = v
    //
    //  T = x,y,z
    //  V = a,b,c
    //  P = d,e,f
    //
    //  (sage format)
    //  solve([x*a+y*b+z*c==v, x*d+y*e+z*f==0, x^2+y^2+z^2==1],x,y,z)
    //
    //	However: a,b, and e = 0; c = 1; so:
    // 	solve([z==v, x*d+z*f==0, x^2+y^2+z^2==1],x,y,z)
    var d = planeNormalX;
    var f = planeNormalZ;
    var v = Math.cos(coneAngle);
    var x = -f * v / d;
    var z = v;
    //var y = sqrt(-d^2*v^2 - f^2*v^2 + d^2)/d;
    var y = Math.sqrt(1 - x * x - z * z);
    if (inplaceVec != null) {
        inplaceVec.set(x, y, z);
    }
    else {
        inplaceVec = new THREE.Vector3(x, y, z);
    }
    return inplaceVec;
};
/**
 * Cone's origin lies on plane.  Cone can be defined by rotating a ray which is "coneAngle" from Z around the
 * Z axis.  This function finds the ray from that rotation which is perpendicular to the plane.
 *
 * In other words, this function finds the direction which is "coneAngle" from the Z axis and 0 degrees (parallel)
 * to "planeNormal".
 *
 * There are either 0, 1, 2, or infinite solutions based on the arguments; the behavior of this function is
 * defined only in the 2 solution cases, when it will return one of the two solutions.
 *
 * The direction is described as a rotation from the min-vec on the plane around the plane axis.  The min-vec
 * is the direction on the plane which is defined by rotating the plane normal PI/2 degrees directly away from the cone
 * axis.  The return value will be a rotation around plane normal from min-vec to the solution direction.
 *
 * @param {number} coneAngle - angle from the cone central axis to the cone walls
 * @param {number} planeNormalOffZ - angle from coneAxis to planeNormal
 * @returns {number} rotation from plane min vec to on-plane-direction perpendicular to the cone
 */
ConeMath.prototype.rotationFromMinPlaneDirToIntersector = function (coneAngle, planeNormalOffZ) {
    // strategy:
    // cone normal V, angle A
    // plane normal P
    // (plane goes through origin of cone)
    //
    // intersection ray T perp to P, and has angle A to V
    // v = cos(A)
    //  T dot P = 0
    //  T dot V = v
    //
    //  T = x,y,z
    //  V = a,b,c
    //  P = d,e,f
    //
    //  (sage format)
    //  solve([x*a+y*b+z*c==v, x*d+y*e+z*f==0, x^2+y^2+z^2==1],x,y,z)
    //
    //	However: a,b, and e = 0; c = 1; so:
    // 	solve([z==v, x*d+z*f==0, x^2+y^2+z^2==1],x,y,z)
    //
    var v = Math.cos(coneAngle);
    //plane normal
    var d = Math.sin(planeNormalOffZ);
    //var e = 0;
    var f = Math.cos(planeNormalOffZ);
    var x = -f * v / d;
    // But, we don't care about the actual xyz's, just the angle deltas, so:
    //
    //  define Q as angle of plane normal off Z (on Y plane)
    //  d becomes sin(Q)
    //  f becomes cos(Q)
    //
    //  on plane rotator (min-vec) becomes
    //  dr = sin(Q+PI/2), dr = cos(Q)
    //  fr = cos(Q+PI/2), fr = -sin(Q)
    //  we want the angle to the intersector, e.g. angle from (dr,er,fr) to (x,y,z)
    //  e.g., acos(dr*x + 0*y + fr*z) //angle between dot product method
    //  from before we have x == -f*v/d, z == v
    //  so, acos(cos(Q) * (-f*v/d) - sin(Q) * v)
    //  or, acos(cos(Q) * (-cos(Q)*v/sin(Q)) - sin(Q) * v)
    return Math.acos(f * x - d * v);
};
module.exports = ConeMath;

},{"@jibo/three":undefined}],100:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var Pose = require("../base/Pose");
var CyclicMath = require("../base/CyclicMath");
/**
 *
 * @param {LookatNode} lookatNode
 * @param {DOFGlobalAlignment} dofAligner
 * @param {string[]} parentDiskDOFNames
 * @constructor
 */
var DiskStabilizationTracker = function (lookatNode, dofAligner, parentDiskDOFNames) {
    /** @type {boolean} */
    var initialized = false;
    /** @type {string[]} */
    var dofNamesInUse = lookatNode.getDOFs();
    /** @type {string} */
    var dofName = null;
    if (dofNamesInUse.length !== 1) {
        throw new Error("DiskStablizationTracker designed for simple 1 dof disk nodes only!");
    }
    else {
        dofName = dofNamesInUse[0];
    }
    ///** @type {Pose} */
    var deltaPoseFromLastTime = new Pose(lookatNode.getName() + " DST Delta", dofNamesInUse);
    /** @type {number} */
    var lastGlobalValue = 0;
    /**
     *
     * @param {Pose} currentPose
     * @param {Pose} optimalPoseForCurrentTarget
     * @param {THREE.Vector3} currentTarget
     * @returns {Pose}
     */
    this.computeStabilizationDelta = function (currentPose, optimalPoseForCurrentTarget, currentTarget) {
        //keep ourselves from drifting away to large equivalent rotations
        lastGlobalValue = CyclicMath.closestEquivalentRotation(lastGlobalValue, 0);
        var currentGlobalValue = 0;
        for (var i = 0; i < parentDiskDOFNames.length; i++) {
            currentGlobalValue += currentPose.get(parentDiskDOFNames[i], 0);
        }
        currentGlobalValue = CyclicMath.closestEquivalentRotation(currentGlobalValue, lastGlobalValue);
        if (initialized) {
            var delta = currentGlobalValue - lastGlobalValue;
            deltaPoseFromLastTime.set(dofName, -delta, 0);
        }
        else {
            deltaPoseFromLastTime.clear();
            for (var f = 0; f < dofNamesInUse.length; f++) {
                deltaPoseFromLastTime.set(dofNamesInUse[f], 0, 0); //start off with zero delta
            }
        }
        lastGlobalValue = currentGlobalValue;
        initialized = true;
        return deltaPoseFromLastTime;
    };
    /**
     * This function computes the portion of each node's velocity that is used to stabilize it against
     * parent motion (e.g., the portion that would be produced by computeStabilizationDelta).  It then subtracts
     * that portion off, and returns the remainder which represents the post-stabilized motion of the node.  These
     * velocities are computed for each dof used by this node, and provided through the inplacePostStabilizationPose
     * argument.
     *
     * @param {Pose} currentPose - current pose and velocities (can be same as inplacePostStabilizationPose)
     * @param {Pose} inplacePostStabilizationPose - inplace argument to receive computed velocities (other values unchanged)
     * @param {THREE.Vector3} target - stabilize with respect to this target
     * @param {number} [rejectionVelocityThreshold=0] - limit the delta component (represented as raw distance over 1/50s) related to stabilization to this value (0 means no limit)
     */
    this.decomposeVelocity = function (currentPose, inplacePostStabilizationPose, target, rejectionVelocityThreshold) {
        /** @type {number} */
        var i;
        if (rejectionVelocityThreshold == null) {
            rejectionVelocityThreshold = 0;
        }
        var currentParentVelocity = 0;
        for (i = 0; i < parentDiskDOFNames.length; i++) {
            currentParentVelocity += currentPose.get(parentDiskDOFNames[i], 1);
        }
        if (rejectionVelocityThreshold !== 0 && Math.abs(currentParentVelocity) > rejectionVelocityThreshold) {
            slog.error("Clamping DST application of unfiltered offset (Velocity) of " + currentParentVelocity + " to " + dofName + " as it is greater than " + rejectionVelocityThreshold);
            if (currentParentVelocity < 0) {
                currentParentVelocity = -rejectionVelocityThreshold;
            }
            else {
                currentParentVelocity = rejectionVelocityThreshold;
            }
        }
        //for(i = 0; i < dofNamesInUse.length; i++){
        //	let d = dofNamesInUse[i];
        //	inplacePostStabilizationPose.set(d, currentPose.get(d, 1) - currentParentVelocity, 1);
        //}
        //only have the one dof based on limits of this stabilizer, so don't need this loop:
        inplacePostStabilizationPose.set(dofName, currentPose.get(dofName, 1) + currentParentVelocity, 1);
    };
    /**
     * Reset between tracking sessions, so the first frame of a new track isn't treated
     * as part of the last tracking (with a large jump).  When computeStabilizationDelta is
     * called multiple times in a row with no intervening reset, it is assumed to be part of
     * a single stabilization session.
     */
    this.reset = function () {
        initialized = false;
    };
};
module.exports = DiskStabilizationTracker;

},{"../../ifr-core/SLog":57,"../base/CyclicMath":70,"../base/Pose":78}],101:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var ExtraMath = require("../../ifr-geometry/ExtraMath");
var PlaneDisplacementLookatDOF = require("./PlaneDisplacementLookatDOF");
var slog = require("../../ifr-core/SLog");
/**
 * @param {string} name
 * @constructor
 */
var FeatureReporter = function (name) {
    this.name = name;
};
/**
 * @param {KinematicGroup} kinematicGroup
 */
FeatureReporter.prototype.connectToGroup = function (kinematicGroup) { }; // eslint-disable-line no-unused-vars
/**
 * @param {Pose} forPose - current pose. attached kinematic group will already be updated to match this pose
 * @return {?{position: THREE.Vector3, direction: THREE.Vector3}}
 * @abstract
 */
FeatureReporter.prototype.computeFeature = function (forPose) { }; // eslint-disable-line no-unused-vars
/**
 * @param {KinematicGroup} kinematicGroupPrototype - used if necessary to find required transform names. NOT saved or bound to!
 * @return {string[]}
 * @abstract
 */
FeatureReporter.prototype.getRequiredTransforms = function (kinematicGroupPrototype) { }; // eslint-disable-line no-unused-vars
/**
 * @param {string} name
 * @param {string} transformName
 * @param {THREE.Vector3} position
 * @param {THREE.Vector3} direction
 * @constructor
 * @extends {FeatureReporter}
 */
var VectorFeatureReporter = function (name, transformName, position, direction) {
    FeatureReporter.call(this, name);
    /**
     * @type {string}
     * @private
     */
    this._transformName = transformName;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._position = position;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._direction = direction;
    /**
     *
     * @type {THREE.Object3D}
     * @private
     */
    this._transform = null;
};
VectorFeatureReporter.prototype = Object.create(FeatureReporter.prototype);
VectorFeatureReporter.prototype.constructor = VectorFeatureReporter;
/**
 * @param {KinematicGroup} kinematicGroup
 */
VectorFeatureReporter.prototype.connectToGroup = function (kinematicGroup) {
    this._transform = null;
    if (kinematicGroup !== null) {
        this._transform = kinematicGroup.getTransform(this._transformName);
        if (this._transform == null) {
            slog.error("VectorFeatureReporter: error initting, did not find transform " + this._transformName + " for feature " + this.name);
        }
    }
};
/**
 * @param {Pose} forPose - current pose. attached kinematic group will already be updated to match this pose
 * @return {?{position: THREE.Vector3, direction: THREE.Vector3}}
 * @override
 */
VectorFeatureReporter.prototype.computeFeature = function (forPose) {
    if (this._transform !== null) {
        var position = null, direction = null;
        if (this._position !== null) {
            position = new THREE.Vector3().copy(this._position);
            this._transform.localToWorld(position);
        }
        if (this._direction !== null) {
            direction = ExtraMath.convertDirectionLocalToWorld(this._transform, this._direction, new THREE.Vector3());
        }
        return { position: position, direction: direction };
    }
    else {
        return null;
    }
};
/**
 * @param {KinematicGroup} kinematicGroupPrototype - used if necessary to find required transform names. NOT saved or bound to!
 * @return {string[]}
 * @abstract
 */
VectorFeatureReporter.prototype.getRequiredTransforms = function (kinematicGroupPrototype) {
    return [this._transformName];
};
/**
 * @param {string} name
 * @param {PlaneDisplacementLookatDOF} planeDisplacementDOF1
 * @param {PlaneDisplacementLookatDOF} planeDisplacementDOF2
 * @constructor
 * @extends {FeatureReporter}
 */
var PlaneDisplacementVectorReporter = function (name, planeDisplacementDOF1, planeDisplacementDOF2) {
    FeatureReporter.call(this, name);
    /**
     * @type {PlaneDisplacementLookatDOF}
     * @private
     */
    this._planeDisplacementDOF1 = planeDisplacementDOF1;
    /**
     * @type {PlaneDisplacementLookatDOF}
     * @private
     */
    this._planeDisplacementDOF2 = planeDisplacementDOF2;
};
PlaneDisplacementVectorReporter.prototype = Object.create(FeatureReporter.prototype);
PlaneDisplacementVectorReporter.prototype.constructor = PlaneDisplacementVectorReporter;
/**
 * @param {KinematicGroup} kinematicGroup
 */
PlaneDisplacementVectorReporter.prototype.connectToGroup = function (kinematicGroup) {
    this._planeDisplacementDOF1.connectToGroup(kinematicGroup);
    this._planeDisplacementDOF2.connectToGroup(kinematicGroup);
};
/**
 * @param {Pose} forPose - current pose. attached kinematic group will already be updated to match this pose
 * @return {?{position: THREE.Vector3, direction: THREE.Vector3}}
 * @override
 */
PlaneDisplacementVectorReporter.prototype.computeFeature = function (forPose) {
    if (this._planeDisplacementDOF1._controlledTransform !== null) {
        var position = new THREE.Vector3();
        var direction = new THREE.Vector3();
        PlaneDisplacementLookatDOF.getVectorFromOrthogonalPDLDs(this._planeDisplacementDOF1, this._planeDisplacementDOF2, forPose, position, direction);
        return { position: position, direction: direction };
    }
    else {
        return null;
    }
};
/**
 * @param {KinematicGroup} kinematicGroupPrototype - used if necessary to find required transform names. NOT saved or bound to!
 * @return {string[]}
 * @abstract
 */
PlaneDisplacementVectorReporter.prototype.getRequiredTransforms = function (kinematicGroupPrototype) {
    //we want the central transform, because it will be needed as coordinate frame:
    var rt = [this._planeDisplacementDOF1._centralTransformName, this._planeDisplacementDOF2._centralTransformName];
    //we also want the transforms that the dof actually moves:
    rt = rt.concat(kinematicGroupPrototype.getModelControlGroup().getRequiredTransformNamesForDOFs([
        this._planeDisplacementDOF1.getControlledDOFName(),
        this._planeDisplacementDOF2.getControlledDOFName()
    ]));
    return rt;
};
/**
 *
 * @param {KinematicGroup} kinematicGroupPrototype - prototype group; this group will be copied, not used.
 * @param {FeatureReporter[]} featureReporters
 * @constructor
 */
var KinematicFeaturesReporter = function (kinematicGroupPrototype, featureReporters) {
    var i;
    var allRequiredTransforms = [];
    for (i = 0; i < featureReporters.length; i++) {
        var r = featureReporters[i].getRequiredTransforms(kinematicGroupPrototype);
        if (r !== null) {
            allRequiredTransforms = allRequiredTransforms.concat(r);
        }
    }
    this._kinematicGroup = kinematicGroupPrototype.getCopy(allRequiredTransforms);
    this._featureRepoters = featureReporters;
    for (i = 0; i < this._featureRepoters.length; i++) {
        this._featureRepoters[i].connectToGroup(this._kinematicGroup);
    }
};
/**
 * @param {Pose} forPose
 * @return {Object.<string,{position: THREE.Vector3, direction: THREE.Vector3}>}
 */
KinematicFeaturesReporter.prototype.computeFeatures = function (forPose) {
    this._kinematicGroup.setFromPose(forPose);
    this._kinematicGroup.updateWorldCoordinateFrames();
    //this._kinematicGroup.getRoot().updateMatrixWorld(true);
    var features = {};
    for (var i = 0; i < this._featureRepoters.length; i++) {
        var fr = this._featureRepoters[i];
        features[fr.name] = fr.computeFeature(forPose);
    }
    return features;
};
KinematicFeaturesReporter.VectorFeatureReporter = VectorFeatureReporter;
KinematicFeaturesReporter.PlaneDisplacementVectorReporter = PlaneDisplacementVectorReporter;
module.exports = KinematicFeaturesReporter;

},{"../../ifr-core/SLog":57,"../../ifr-geometry/ExtraMath":62,"./PlaneDisplacementLookatDOF":114,"@jibo/three":undefined}],102:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var LookatNodeTrackPolicy = require("./trackpolicy/LookatNodeTrackPolicy");
/**
 * @interface BlinkDelegate
 * @intdocs
 */
/**
 * @function
 * @name BlinkDelegate#blink
 * @param {boolean} [interrupt]
 */
/**
 * Blink manager will trigger a blink if all the following conditions are met:
 * 	- we are in an active track mode (not HOLD or DELAY)
 * 	- enough time has passed since the last blink*
 * 	- enough delta is present from filtered ("current") position and target position
 *
 * 	 * there are 2 time thresholds,
 * 	 	- time between blinks on the same motion (we have not stopped moving between blinks)
 * 	    - time between blinks across trajectories (we have stopped in between blinks)
 * 	 a small value for the former could allow 2 blinks on the same motion
 *
 * @param {BlinkDelegate} blinkDelegate
 * @param {number} triggerAtDelta - delta angle to trigger a blink
 * @param {number} minRetriggerTimeSameTrajectory - require this amount of time between triggerings in cases where zero delta not achieved
 * @param {number} minRetriggerTimeAcrossTrajectories - require this amount of time between triggerings in case where zero delta achieved between triggers
 * @param {number} minDeltaToMarkTrajectoryOver - min distance to count as zeroing, ie, target achieved
 * @param {number} onlyAtOrAfterWindupPhase - delay blink trigger to at or after this windup phase.  null for no delay. (no delay if no windup on this node)
 * @constructor
 */
var LookatBlinkManager = function (blinkDelegate, triggerAtDelta, minRetriggerTimeSameTrajectory, minRetriggerTimeAcrossTrajectories, minDeltaToMarkTrajectoryOver, onlyAtOrAfterWindupPhase) {
    /** @type {BlinkDelegate} */
    this.blinkDelegate = blinkDelegate;
    /** @type {number} */
    this.triggerAtDelta = triggerAtDelta;
    /** @type {number} */
    this.minRetriggerTimeSameTrajectory = minRetriggerTimeSameTrajectory;
    /** @type {number} */
    this.minRetriggerTimeAcrossTrajectories = minRetriggerTimeAcrossTrajectories;
    /** @type {number} */
    this.minDeltaToMarkTrajectoryOver = minDeltaToMarkTrajectoryOver;
    /**
     * If windup is present, only trigger during the windup phase specified or at later phases.
     * Ignored if no windup. Null for any phase.
     * @type {?number}
     */
    this.onlyAtOrAfterWindupPhase = onlyAtOrAfterWindupPhase;
    /** @type {Time} */
    this.lastTriggerTime = null;
    this.achievedZeroSinceLastBlink = false;
};
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport - distance report
 * @param {TrackMode} trackMode - current tracking mode
 * @param {?WindupState} windupState - progress through windup, or null if no windup is present on this node
 * @param {Time} currentTime - time
 */
LookatBlinkManager.prototype.update = function (lookatNodeDistanceReport, trackMode, windupState, currentTime) {
    if (trackMode !== LookatNodeTrackPolicy.TrackMode.DELAY && trackMode !== LookatNodeTrackPolicy.TrackMode.HOLD) {
        //active track mode, ok to blink
        if (this.lastTriggerTime === null ||
            (this.achievedZeroSinceLastBlink && currentTime.subtract(this.lastTriggerTime) >= this.minRetriggerTimeAcrossTrajectories) ||
            (!this.achievedZeroSinceLastBlink && currentTime.subtract(this.lastTriggerTime) >= this.minRetriggerTimeSameTrajectory)) {
            //it has been long enough, ok to blink
            if (lookatNodeDistanceReport.highestDistanceOptimalToFiltered >= this.triggerAtDelta) {
                if (this.onlyAtOrAfterWindupPhase === null || windupState === null || windupState >= this.onlyAtOrAfterWindupPhase) {
                    //only restrict to windup phase if we are configured to restrict, and the windup state is non-null (windup present/exists)
                    //blink!
                    this.blinkDelegate.blink();
                    this.lastTriggerTime = currentTime;
                    this.achievedZeroSinceLastBlink = false;
                }
            }
        }
        if (!this.achievedZeroSinceLastBlink && lookatNodeDistanceReport.highestDistanceOptimalToFiltered < this.minDeltaToMarkTrajectoryOver) {
            //console.log("Marking blink as having paused due to close distance");
            this.achievedZeroSinceLastBlink = true;
        }
    }
    else {
        //console.log("Marking blink as having paused due to HOLD/DELAY");
        this.achievedZeroSinceLastBlink = true;
    }
};
module.exports = LookatBlinkManager;

},{"./trackpolicy/LookatNodeTrackPolicy":121}],103:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 *
 * @param {string} name
 * @param {string} controlledDOFName
 * @constructor
 */
var LookatDOF = function (name, controlledDOFName) {
    /** @type {string} */
    this._name = name;
    /** @type {string} */
    this._controlledDOFName = controlledDOFName;
    /** @type {KinematicGroup} */
    this._kinematicGroup = null;
};
/**
 * @param {KinematicGroup} kinematicGroup group to use for kinematic math (assumed to be configured as desired before valToPointAtTarget calls)
 */
LookatDOF.prototype.connectToGroup = function (kinematicGroup) {
    this._kinematicGroup = kinematicGroup;
};
/**
 * Compute value is relative to current setup of the hierarchy that transform is part of.
 *
 * @param {THREE.Vector3} target - world space target
 * @param {PointReport} [pointReport] - optional report for holding meta info produced by computation
 * @param {Pose} [currentPose] - currentPose of the bot, should be same as pose represented by associated kinematic group
 * @abstract
 * @return {number} Value to cause this._control to point local this._forwardDir at the target
 */
LookatDOF.prototype.valToPointAtTarget = function (target, pointReport, currentPose) { }; // eslint-disable-line no-unused-vars
LookatDOF.prototype.getName = function () {
    return this._name;
};
LookatDOF.prototype.getControlledDOFName = function () {
    return this._controlledDOFName;
};
/**
 * Provide the ratio that this error represents for the range of motion of this LookatDOF
 * @param errorAbsolute absolute error
 * @return {number} ratio that absoluteError represents of the total range of this LookatDOF
 */
LookatDOF.prototype.errorRatio = function (errorAbsolute) { }; // eslint-disable-line no-unused-vars
/**
 * provide a suggestion for a target that is forward for this lookat (node is already looking at this point)
 * @param {THREE.Vector3} inplaceVec
 * @return {THREE.Vector3}
 * @abstract
 */
LookatDOF.prototype.suggestForwardTarget = function (inplaceVec) { }; // eslint-disable-line no-unused-vars
module.exports = LookatDOF;

},{}],104:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var PoseOffsetFilterWindup = require("./PoseOffsetFilterWindup");
var Pose = require("../base/Pose");
var slog = require("../../ifr-core/SLog");
var THREE = require("@jibo/three");
var LookatNode = require("./LookatNode");
var LookatNodeDistanceReport = require("./LookatNodeDistanceReport");
var LookatNodeTrackPolicy = require("./trackpolicy/LookatNodeTrackPolicy");
var TrackPolicyTriggerAlways = require("./trackpolicy/TrackPolicyTriggerAlways");
/**
 * Enum Values for look stabilization modes, for use with LookatMotionNode's constructor.
 * @enum {string}
 */
var LookStabilizationMode = {
    /**
     * Use point-at stabilization relative to current target.
     */
    POINT_TARGET: "POINT_TARGET",
    /**
     * Use point-st stabilization relative to node forward.
     */
    POINT_FORWARD: "POINT_FORWARD",
    /**
     * Use point-at from target when it scores stable, forward relative otherwise
     */
    POINT_AUTO: "POINT_AUTO",
    /**
     * Stabilizer doesn't need a target; none will be computed
     */
    UNTARGETED: "UNTARGETED"
};
/**
 *
 * @param {LookatNode} lookatNode - assumed to be in order root to leaf
 * @param {DOFGlobalAlignment} dofAligner
 * @param {number} accel - acceleration value for this node
 * @param {OcularStabilizationTracker} stabilizer - specify stabilizer
 * @param {LookStabilizationMode} stabilizationMode - specify stabilization mode
 * @param {LookatNodeTrackPolicy} trackPolicy
 * @param {LookatBlinkManager} [blinkManager]
 * @param {LookatNodeTargetAdjuster} [targetAdjuster]
 * @param {LookatWindupPolicy} [windupPolicy]
 * @param {WorldTargetAdjuster} [worldTargetAdjuster]
 * @constructor
 */
var LookatMotionNode = function (lookatNode, dofAligner, accel, stabilizer, stabilizationMode, trackPolicy, blinkManager, targetAdjuster, windupPolicy, worldTargetAdjuster) {
    /** @type {LookatNode} */
    this._lookatNode = lookatNode;
    /** @type {OcularStabilizationTracker} */
    this._stabilization = stabilizer;
    var lookatNodeDOFs = lookatNode.getDOFs();
    /** @type {PoseOffsetFilterWindup} */
    this._filter = new PoseOffsetFilterWindup(lookatNodeDOFs);
    this._filter.setRejectVelocityThreshold(20);
    if (accel != null) {
        this._filter.setAcceleration(accel);
    }
    /** @type {Time} */
    this._lastUpdateTime = null;
    /** @type {Pose} */
    this._optimalPose = new Pose("LMN Optimal", lookatNodeDOFs);
    /** @type {Pose} */
    this._tempPose = new Pose("LMN Temp", lookatNodeDOFs);
    /** @type {THREE.Vector3} */
    this._stabilizationTarget = new THREE.Vector3();
    /** @type {Pose} */
    this._poseForStabilizationTarget = new Pose("Pose For ST", lookatNodeDOFs);
    /** @type {Pose} */
    this._holdPose = new Pose("Hold Pose", lookatNodeDOFs);
    /**
     * This will get created when we connect to a hierarchy (then it will have minimal dofs necessary)
     * @type {Pose}
     */
    this._lastInputPose = null;
    //this._lastReturnedPose = new Pose("Last Returned", lookatNodeDOFs);
    /**
     * This will get created when we connect to a hierarchy (then it will have minimal dofs necessary)
     * @type {Pose}
     */
    this._currentPoseIncludingOurContribution = null;
    /** @type {LookatNodeTrackPolicy} */
    this._lookatTrackPolicy = trackPolicy;
    if (this._lookatTrackPolicy == null) {
        this._lookatTrackPolicy = new LookatNodeTrackPolicy([new TrackPolicyTriggerAlways()]);
    }
    /** @type {LookatBlinkManager} */
    this._blinkManager = null;
    if (blinkManager != null) {
        this._blinkManager = blinkManager;
    }
    /** @type {LookatNodeTargetAdjuster} */
    this._targetAdjuster = null;
    if (targetAdjuster != null) {
        this._targetAdjuster = targetAdjuster;
    }
    /**
     * holds the optimal pose adjusted by the targetAdjuster, if present.  (e.g., lazier looking)
     * @type {Pose}
     */
    this._adjustedOptimalPose = this._optimalPose;
    //if we have no target adjuster, save time by having these be the same pose and not copying later
    if (targetAdjuster != null) {
        //if we do have a target adjuster, this must be its own distinct pose
        this._adjustedOptimalPose = new Pose("LMN Adjusted Optimal", lookatNodeDOFs);
    }
    /** @type {DOFGlobalAlignment} */
    this._dofAligner = dofAligner;
    /**
     * stabilization mode
     * @type {LookStabilizationMode} */
    this._stabilizationMode = stabilizationMode;
    /**
     * @type {LookatWindupPolicy}
     * @private
     */
    this._lookatWindupPolicy = null;
    if (windupPolicy != null) {
        this._lookatWindupPolicy = windupPolicy;
        this._lookatWindupPolicy.configureFilter(this._filter);
    }
    /**
     * @type {WorldTargetAdjuster}
     * @private
     */
    this._worldTargetAdjuster = null;
    if (worldTargetAdjuster != null) {
        this._worldTargetAdjuster = worldTargetAdjuster;
    }
    /**
     * @type {LookatNodeDistanceReport}
     * @private
     */
    this._lookatNodeDistanceReport = new LookatNodeDistanceReport();
    /**
     * @type {TrackMode}
     * @private
     */
    this._trackMode = LookatNodeTrackPolicy.TrackMode.TRACK;
    this._individuallyForwardPose = new Pose("Individually Forward", lookatNodeDOFs);
    ///**
    // * @type {function}
    // * @private
    // */
    //this._infoListener = null;
};
LookatMotionNode.LookStabilizationMode = LookStabilizationMode;
/**
 * Connect to this group.  Best to provide a group with the minimal dofs required,
 * e.g., the ones that this node uses/modifies plus any ancestors.
 * @param {KinematicGroup} kinematicGroup
 */
LookatMotionNode.prototype.connectToGroup = function (kinematicGroup) {
    //init poses here that want to have minimal dofs but include all ancestors
    this._lastInputPose = new Pose("Last Input", kinematicGroup.getDOFNames()); //, kinematicGroup.getDOFNames());
    //give initial values here so we don't have to check for init every update
    //_lastInputPose is just used to zero out jitter, so we don't need to worry about the initial value
    //(input is pulled to this value if VERY close)
    for (var i = 0; i < this._lastInputPose.dofIndices.length; i++) {
        this._lastInputPose.setByIndex(this._lastInputPose.dofIndices[i], 0, 0);
    }
    this._currentPoseIncludingOurContribution = new Pose("Current Including Us", kinematicGroup.getDOFNames());
    this._lookatNode.connectToGroup(kinematicGroup);
};
/**
 * Update state to the current time and produce the new filtered pose.
 * If called twice at the same "time", second call will not recompute,
 * and will instead return the same pose.
 *
 * @param {Pose} currentPose - use parents' position from here to compute our values.  velocities and positions of currentPose (our node and parents) must be correct on first update after reset! (initialization update)
 * @param {Pose} inplaceOutput
 * @param {THREE.Vector3} target
 * @param {Time} time
 */
LookatMotionNode.prototype.update = function (currentPose, inplaceOutput, target, time) {
    if (this._lastUpdateTime !== null && time.equals(this._lastUpdateTime)) {
        this._filter.getValue(inplaceOutput);
        return;
    }
    //configure default pose (to use as "optimal" if we can't make a computation this tick)
    //also set current pose to include our contribution from last time
    var defaultPose;
    if (this._lastUpdateTime === null) {
        //not initialized, must make do
        defaultPose = currentPose;
    }
    else {
        //initialized, previous optimal will be a good default for uncomputable joints
        defaultPose = this._optimalPose;
        //if it is the first tick, currentPose will be set correctly already.
        //if it is not the first tick, current will not contain our contribution to the dofs, as it is our job to add it
        //however, we want "current" to be representative of the current WRT this system's output (excluding later additions.
        // (e.g., the value we would return that would keep the robot in place)
        //so, we set change current to have our output from last time.
        this._currentPoseIncludingOurContribution.setPose(currentPose);
        this._filter.getValue(this._currentPoseIncludingOurContribution);
        currentPose = this._currentPoseIncludingOurContribution;
    }
    /////don't pass through numeric jitter; it will invalidate everyone's caching for no real gain/////
    var dofIndices = this._lastInputPose.getDOFIndices();
    var distance = 0;
    for (var i = 0; i < dofIndices.length; i++) {
        distance += Math.abs(this._lastInputPose.getByIndex(dofIndices[i], 0) - currentPose.getByIndex(dofIndices[i], 0));
    }
    if (distance <= 0.000001) {
        currentPose = this._lastInputPose;
        //console.log("Freezing "+this.getName()+" to top:"+currentPose.get("topSection_r", 0)+", mid:"+currentPose.get("middleSection_r", 0)+", bottom:"+currentPose.get("bottomSection_r", 0));
    }
    else {
        this._lastInputPose.setPose(currentPose);
    }
    ////numeric jitter accounted for///////////////
    if (this._worldTargetAdjuster !== null) {
        var adjustedWorldTarget = this._worldTargetAdjuster.getAdjustedTarget(currentPose, target);
        if (adjustedWorldTarget !== null) {
            target = adjustedWorldTarget;
        }
    }
    var report = new LookatNode.PointNodeReport();
    this._lookatNode.getPose(currentPose, this._optimalPose, target, defaultPose, report, this._lastUpdateTime === null ? null : this._optimalPose);
    this._lookatNode.getIndividuallyForwardPose(this._individuallyForwardPose);
    //modify optimal based on target modifier (e.g., our target may be lazier than geometrical optimal, etc.)
    if (this._targetAdjuster !== null) {
        if (this._lastUpdateTime === null) {
            //first tick, currentPose will be our actual currentPose including our own dofs
            this._targetAdjuster.adjustTarget(this._optimalPose, currentPose, target, this._dofAligner, this._adjustedOptimalPose);
        }
        else {
            //we are in progress, currentPose may not contain our contribution,
            // use the filter to get our last output value
            this._filter.getValue(this._tempPose);
            this._targetAdjuster.adjustTarget(this._optimalPose, this._tempPose, target, this._dofAligner, this._adjustedOptimalPose);
        }
        //console.log("Adjusted target from "+this._optimalPose+" to "+this._adjustedOptimalPose);
    }
    if (this._stabilization !== null && this._stabilizationMode !== LookStabilizationMode.UNTARGETED) {
        if (this._stabilizationMode === LookStabilizationMode.POINT_FORWARD ||
            (this._stabilizationMode === LookStabilizationMode.POINT_AUTO &&
                (report._targetStability < 0.2 || !report._pointSucceeded))) {
            if (this._stabilizationMode === LookStabilizationMode.POINT_AUTO) {
                slog.info("Stabilization AUTO mode for " + this.getName() + " falling back to FORWARD with stability " + report._targetStability + ", pointSuccess=" + report._pointSucceeded);
            }
            this._lookatNode.suggestForwardTarget(currentPose, this._stabilizationTarget);
            this._lookatNode.getPose(currentPose, this._poseForStabilizationTarget, this._stabilizationTarget, defaultPose, null, this._lastUpdateTime === null ? null : this._poseForStabilizationTarget);
        }
        else {
            this._stabilizationTarget.copy(target);
            this._poseForStabilizationTarget.setPose(this._optimalPose);
        }
    }
    //hold is hold, but already stabilized
    if (this._lastUpdateTime === null) {
        //init hold pose to the state at the start
        this._holdPose.setPose(currentPose);
        this._lookatTrackPolicy.reset();
        if (this._stabilization !== null) {
            this._stabilization.reset();
            this._stabilization.computeStabilizationDelta(currentPose, this._poseForStabilizationTarget, this._stabilizationTarget); //initialize for next time
            this._tempPose.setPose(currentPose);
            this._stabilization.decomposeVelocity(currentPose, this._tempPose, this._stabilizationTarget, this._filter.getRejectVelocityThreshold());
            //tempPose has velocity removed that will later be added back in by the stabilization delta.
            //console.log("Lookat Initting " + this.getName() + " stabilized(world space):" + this._tempPose.toString());
            this._filter.resetToPose(this._tempPose);
        }
        else {
            this._filter.resetToPose(currentPose);
        }
    }
    else {
        var dTime = time.subtract(this._lastUpdateTime);
        this._filter.getTarget(this._tempPose);
        this._dofAligner.refineToLocallyClosestTargetPose(this._tempPose, this._adjustedOptimalPose);
        if (this._stabilization !== null) {
            var delta = this._stabilization.computeStabilizationDelta(currentPose, this._poseForStabilizationTarget, this._stabilizationTarget);
            //console.log("Lookat Node " + this.getName() + " has stabilization delta " + delta.toString());
            //var delta = new Pose("temp", currentPose.getDOFNames());
            this._filter.applyUnfilteredOffset(delta, dTime);
            Pose.add(this._holdPose, delta, false, this._holdPose);
        }
        this._filter.getValue(this._tempPose, true); //grab current filter value to check our progress
        this._lookatNodeDistanceReport.compute(this._holdPose, this._adjustedOptimalPose, this._tempPose);
        this._trackMode = this._lookatTrackPolicy.computeMode(this._lookatNodeDistanceReport, time);
        if (this._lookatWindupPolicy !== null) {
            var shouldTriggerWindup = this._lookatWindupPolicy.shouldWindup(this._lookatNodeDistanceReport, this._trackMode, time, target);
            if (shouldTriggerWindup) {
                this._filter.startWindupIfPossible();
            }
        }
        var updateHoldPose = false;
        if (this._trackMode === LookatNodeTrackPolicy.TrackMode.HOLD || this._trackMode === LookatNodeTrackPolicy.TrackMode.DELAY) {
            this._filter.setTarget(this._holdPose);
        }
        else {
            this._filter.setTarget(this._adjustedOptimalPose);
            updateHoldPose = true;
        }
        this._filter.updateByTime(dTime);
        //we update blinkManager after updateByTime, because the filter won't compute its windup
        //params until this point, and blink may depend on windup state.
        if (this._blinkManager !== null) {
            var windupState = null;
            if (this._lookatWindupPolicy !== null) {
                windupState = this._filter.getWindupState();
            }
            this._blinkManager.update(this._lookatNodeDistanceReport, this._trackMode, windupState, time);
        }
        if (updateHoldPose) {
            this._filter.getValue(this._holdPose);
        }
    }
    if (inplaceOutput != null) {
        this._filter.getValue(inplaceOutput);
        //if(this._infoListener!==null){
        //	var theDOFs = this.getDOFs();
        //	for(var k = 0; k < theDOFs.length; k++) {
        //		var theDOF = theDOFs[k];
        //		this._infoListener({
        //			dofName: theDOF,
        //			timestamp: time,
        //			currentPosition: currentPose.get(theDOF, 0),
        //			optimalPosition: this._optimalPose.get(theDOF, 0),
        //			adjustedOptimal: this._adjustedOptimalPose.get(theDOF, 0),
        //			filteredPosition: inplaceOutput.get(theDOF, 0),
        //			stabilizationDelta: delta!=null?delta.get(theDOF, 0):0,
        //			solution1: report.solution1!=undefined?report.solution1:0,
        //			solution2: report.solution2!=undefined?report.solution2:0
        //		});
        //	}
        //}
    }
    this._lastUpdateTime = time;
};
/**
 * Produces the optimal lookat pose, regardless of current state/time.  Does not update state.  Does not apply
 * LookatNodeTargetAdjuster
 *
 * @param {Pose} currentPose
 * @param {Pose} inplaceOutput
 * @param {THREE.Vector3} target
 */
LookatMotionNode.prototype.getOptimalPose = function (currentPose, inplaceOutput, target) {
    var defaultPose;
    if (this._lastUpdateTime === null) {
        //not initialized, must make do
        defaultPose = currentPose;
    }
    else {
        //initialized, previous optimal will be a good default for uncomputable joints
        defaultPose = this._optimalPose;
    }
    this._lookatNode.getPose(currentPose, inplaceOutput, target, defaultPose);
};
/**
 * Get the latest computed pose.  Does not advance (use update()).  Only
 * valid after initialized, typically by first call to update() after init or reset.
 *
 * @param {Pose} inplaceOutput
 */
LookatMotionNode.prototype.getPose = function (inplaceOutput) {
    if (this._lastUpdateTime === null) {
        slog.error("LookatMotionNode asked \"getPose()\" before initialization");
    }
    this._filter.getValue(inplaceOutput);
};
/**
 * Get the individual forward information for the last computed Pose, does not update state.  Only valid
 * after initialization.
 *
 * @param {Pose} inplaceAtTarget - provide the forward vals here (a dof will be cleared out if unavailable).  May be null or have incomplete dofs.
 * @param {Pose} inplaceAtCurrent - provide the forward vals at current position (e.g., in progress to target), a dof will by cleared out if unavailable). May be null or have incomplete dofs.
 */
LookatMotionNode.prototype.getIndividuallyForwardPose = function (inplaceAtTarget, inplaceAtCurrent) {
    if (this._lastUpdateTime === null) {
        slog.error("LookatMotionNode asked \"getIndividuallyForwardPose()\" before initialization");
    }
    if (inplaceAtCurrent !== null) {
        if (this._lookatNode.valsAreIndividuallyForward()) {
            this._filter.getValue(inplaceAtCurrent);
        }
        else {
            inplaceAtCurrent.clear();
        }
    }
    if (inplaceAtTarget !== null) {
        ///don't get right now, get the one cached after the optimal computation,
        //so it is not polluted by the later getPoses that may be used for stabilization etc.
        this._individuallyForwardPose.getPose(inplaceAtTarget);
    }
};
/**
 * Get the distance remaining from filtered to optimal.  Does not advance (use update())
 * This value is computed from the data calculated in the last update() call.
 *
 * This is the distance to the adjusted optimal pose, e.g., if we have target undershoot enabled,
 * and we have gotten to our proper undershot target (short of actual target), this value will be approaching zero.
 *
 * @return {number} distance of dof with largest remaining distance (as ratio of current distance of total range of LookatDOF)
 */
LookatMotionNode.prototype.getDistanceRemaining = function () {
    if (this._lastUpdateTime === null) {
        slog.error("LookatMotionNode asked \"getDistanceRemaining()\" before initialization");
    }
    this._filter.getValue(this._tempPose);
    return this._lookatNode.distanceAsRatio(this._tempPose, this._adjustedOptimalPose);
};
/**
 * Get all the dofs that are modified by this node
 * @return {string[]}
 */
LookatMotionNode.prototype.getDOFs = function () {
    return this._lookatNode.getDOFs();
};
/**
 * Get all the dofs that are needed in the provided kinematic group
 * (may include dofs that will not be modified by this node)
 * @return {string[]}
 */
LookatMotionNode.prototype.getDOFsNeededInKG = function () {
    return this._lookatNode.getDOFsNeededInKG();
};
LookatMotionNode.prototype.reset = function () {
    this._lastUpdateTime = null;
    this._trackMode = LookatNodeTrackPolicy.TrackMode.TRACK;
};
LookatMotionNode.prototype.getName = function () {
    return this._lookatNode.getName();
};
/**
 * The the track mode as of the last update of this node.
 * (Nodes are initted in TRACK before their first update)
 * @returns {TrackMode}
 */
LookatMotionNode.prototype.getTrackMode = function () {
    return this._trackMode;
};
/**
 * True if this node is in HOLD mode as of the last update of this node.  NOTE: node can be in DELAY mode, which
 * means it is not moving but expects to.  For certain discomfort configurations
 * this period could last a significant time.
 * (nodes are initted in TRACK before their first update)
 * @returns {boolean}
 */
LookatMotionNode.prototype.getInHoldMode = function () {
    return this._trackMode === LookatNodeTrackPolicy.TrackMode.HOLD;
};
/**
 * True if this node is in TRACK mode as of the last update of this node.  NOTE: node can be in DELAY mode, which
 * means it is not moving but expects to.  For certain discomfort configurations
 * this period could last a significant time.
 *
 * To avoid false-positive on tracking mode (we start in track mode) we will and with whether the track policy
 * has been updated since the last reset.
 *
 * @returns {boolean}
 */
LookatMotionNode.prototype.getInTrackMode = function () {
    return this._trackMode === LookatNodeTrackPolicy.TrackMode.TRACK && (this._lookatTrackPolicy === null || this._lookatTrackPolicy.hasBeenUpdatedSinceReset());
};
module.exports = LookatMotionNode;

},{"../../ifr-core/SLog":57,"../base/Pose":78,"./LookatNode":105,"./LookatNodeDistanceReport":106,"./PoseOffsetFilterWindup":117,"./trackpolicy/LookatNodeTrackPolicy":121,"./trackpolicy/TrackPolicyTriggerAlways":123,"@jibo/three":undefined}],105:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var PointADOF = require("./PointADOF");
var Pose = require("../base/Pose");
var slog = require("../../ifr-core/SLog");
var channel = "LOOKAT";
var PointNodeReport = function () {
    /**
     * 0 for unstable target, 1 for very stable
     * @type {?number} */
    this._targetStability = null;
    this._pointSucceeded = true;
};
/**
 *
 * @param {string} name
 * @param {LookatDOF[]} lookatDOFs - assumed to be in order root to leaf
 * @param {KinematicGroup} myKinematicGroup
 * @constructor
 */
var LookatNode = function (name, lookatDOFs) {
    /** @type {string} */
    this._name = name;
    /** @type {LookatDOF[]} */
    this._lookatDOFs = lookatDOFs;
    /** @type {KinematicGroup} */
    this._kinematicGroup = null;
    /** @type {Pose} */
    this._lastPose = new Pose(name + "'s last pose", this.getDOFs());
};
LookatNode.PointNodeReport = PointNodeReport;
/**
 * @param {KinematicGroup} kinematicGroup
 */
LookatNode.prototype.connectToGroup = function (kinematicGroup) {
    this._kinematicGroup = kinematicGroup;
    for (var i = 0; i < this._lookatDOFs.length; i++) {
        this._lookatDOFs[i].connectToGroup(this._kinematicGroup);
    }
};
/**
 *
 * @param {PointReport} newDOFReport
 * @param {PointNodeReport} nodeReportInplace
 */
function updateReport(newDOFReport, nodeReportInplace, pointSucceeded) {
    var angleValue = newDOFReport._angleToAxis / (Math.PI / 2);
    var distanceValue = Math.min(newDOFReport._distanceToTarget * 5, 1); //1 for >20cm, linear score down to 0 from there.
    if (nodeReportInplace._targetStability === null) {
        nodeReportInplace._targetStability = angleValue * distanceValue;
    }
    else {
        nodeReportInplace._targetStability *= (angleValue * distanceValue);
    }
    if (!pointSucceeded) {
        nodeReportInplace._pointSucceeded = false;
    }
    //if(nodeReportInplace._targetStability > 1.001){
    //	console.log("stability = "+nodeReportInplace._targetStability+", "+newDOFReport._angleToAxis+", "+newDOFReport._distanceToTarget);
    //}
}
/**
 *
 * @param {Pose} currentPose
 * @param {Pose} inplaceOutput
 * @param {THREE.Vector3} target
 * @param {Pose} [defaultPose] - use this pose's values in place of values that cannot be currently computed. (currentPose used if ommitted)
 * @param {PointNodeReport} [pointNodeReport] - inplace arg to return metadata about combined computation
 * @param {Pose} [lastProduced] - the pose we last produced (used for consistency if this node must choose from multiple options.  null if this is a new track.  ok to be same as inplaceOutput)
 * @return {boolean} true if all nodes computed a value; false if one or more was uncomputable and had to utilize defaultPose.
 */
LookatNode.prototype.getPose = function (currentPose, inplaceOutput, target, defaultPose, pointNodeReport, lastProduced) {
    if (inplaceOutput !== currentPose) {
        inplaceOutput.setPose(currentPose);
    }
    if (defaultPose == null) {
        defaultPose = currentPose;
    }
    var anyFailures = false;
    this._kinematicGroup.setFromPose(currentPose);
    //this._kinematicGroup.getRoot().updateMatrixWorld(true);
    this._kinematicGroup.updateWorldCoordinateFrames();
    var pointDOFReport = null;
    for (var i = 0; i < this._lookatDOFs.length; i++) {
        if (pointNodeReport) {
            pointDOFReport = new PointADOF.PointReport();
        }
        var value = this._lookatDOFs[i].valToPointAtTarget(target, pointDOFReport, currentPose);
        if (pointDOFReport) {
            updateReport(pointDOFReport, pointNodeReport, value != null);
            //if(pointDOFReport.solution1!=undefined){
            //	pointNodeReport.solution1 = pointDOFReport.solution1;
            //	pointNodeReport.solution2 = pointDOFReport.solution2;
            //}
        }
        if (value != null) {
            inplaceOutput.set(this._lookatDOFs[i].getControlledDOFName(), value, 0);
        }
        else {
            slog(channel, "LookatNode " + this._name + " using last value due to uncomputable value for target (" + target.x + ", " + target.y + ", " + target.z + ")");
            inplaceOutput.set(this._lookatDOFs[i].getControlledDOFName(), defaultPose.get(this._lookatDOFs[i].getControlledDOFName(), 0), 0);
            anyFailures = true;
        }
        if (i < this._lookatDOFs.length - 1) {
            this._kinematicGroup.setFromPose(inplaceOutput);
            //this._kinematicGroup.getRoot().updateMatrixWorld(true);
            this._kinematicGroup.updateWorldCoordinateFrames();
        }
    }
    this._lastPose.setPose(inplaceOutput);
    return !anyFailures;
};
/**
 * The output of a node may have each individual dof pointing differently from its own forward for
 * a collective goal; provide the individual forwards here from the last getPose computation.
 * (useful in some cases to restore configuration to same perceived orientation but with less dofs)
 *
 * Override both this and valsAreIndividuallyForward together.  A DOF will be cleared out if data
 * is unavailable
 *
 * @param {Pose} inplacePose
 */
LookatNode.prototype.getIndividuallyForwardPose = function (inplacePose) {
    //by default, assume all dofs are individually forward in normal operation
    inplacePose.setPose0Only(this._lastPose);
};
/**
 * See getIndividuallyForwardPose.  This function returns true if the individual forwards
 * are the same as what is provided with getPose().  Override both this and getIndividuallyForwardPose
 * together.
 *
 * @returns {boolean} true if the usual values (getPose()) indicate optimal forward indivdually
 */
LookatNode.prototype.valsAreIndividuallyForward = function () {
    //by default, assume all dofs are individually forward in normal operation
    return true;
};
/**
 * Get all the dofs that are modified by this node
 * @return {string[]}
 */
LookatNode.prototype.getDOFs = function () {
    var allDOFs = [];
    for (var i = 0; i < this._lookatDOFs.length; i++) {
        allDOFs.push(this._lookatDOFs[i].getControlledDOFName());
    }
    return allDOFs;
};
/**
 * Get all the dofs that are needed in the provided kinematic group
 * (may include dofs that will not be modified by this node)
 * @return {string[]}
 */
LookatNode.prototype.getDOFsNeededInKG = function () {
    return this.getDOFs();
};
/**
 * Find the distance between 2 poses, only accounting for DOFs that are part of this LookatNode.
 * The difference is calculated as a ratio (of error over dof range) rather than absolute value.
 * This function is designed to give a metric lookat progress, e.g., pass in optimal and
 * filtered/current to see how far the lookat still has to go.
 *
 * @param {Pose} pose1
 * @param {Pose} pose2
 * @return {number} greatest ratio (distance/totalDistance) of any of our lookat DOFs between pose1 to pose2
 */
LookatNode.prototype.distanceAsRatio = function (pose1, pose2) {
    var maxRatio = 0;
    for (var i = 0; i < this._lookatDOFs.length; i++) {
        var lookatDOF = this._lookatDOFs[i];
        var dofName = lookatDOF.getControlledDOFName();
        var p1v = pose1.get(dofName, 0);
        var p2v = pose2.get(dofName, 0);
        var ratio = lookatDOF.errorRatio(p1v - p2v);
        if (ratio > maxRatio) {
            maxRatio = ratio;
        }
    }
    return maxRatio;
};
/**
 * @returns {string}
 */
LookatNode.prototype.getName = function () {
    return this._name;
};
/**
 *
 * @param {Pose} currentPose - use this current pose
 * @param {THREE.Vector3} inplaceVec
 * @return {THREE.Vector3} a suggestion for a target that is forward for this lookat (node is already looking at this point)
 */
LookatNode.prototype.suggestForwardTarget = function (currentPose, inplaceVec) {
    this._kinematicGroup.setFromPose(currentPose);
    //this._kinematicGroup.getRoot().updateMatrixWorld(true);
    this._kinematicGroup.updateWorldCoordinateFrames();
    return this._lookatDOFs[0].suggestForwardTarget(inplaceVec);
};
module.exports = LookatNode;

},{"../../ifr-core/SLog":57,"../base/Pose":78,"./PointADOF":115}],106:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
/**
 * @constructor
 */
var LookatNodeDistanceReport = function () {
    /** @type{number} */
    this.highestDistanceHoldToFiltered = 0;
    /** @type{number} */
    this.highestDistanceHoldToOptimal = 0;
    /** @type{number} */
    this.highestDistanceOptimalToFiltered = 0;
    /** @type{number} */
    this.highestVelocityFiltered = 0;
};
/**
 * @param {Pose} holdPose
 * @param {Pose} optimalPose
 * @param {Pose} filteredOutput
 */
LookatNodeDistanceReport.prototype.compute = function (holdPose, optimalPose, filteredOutput) {
    this.highestDistanceHoldToFiltered = 0;
    this.highestDistanceHoldToOptimal = 0;
    this.highestDistanceOptimalToFiltered = 0;
    this.highestVelocityFiltered = 0;
    var dofIndices = holdPose.getDOFIndices();
    for (var i = 0; i < dofIndices.length; i++) {
        var index = dofIndices[i];
        var distanceHoldToFiltered = Math.abs(holdPose.getByIndex(index, 0) - filteredOutput.getByIndex(index, 0));
        var distanceHoldToOptimal = Math.abs(holdPose.getByIndex(index, 0) - optimalPose.getByIndex(index, 0));
        var distanceOptimalToFiltered = Math.abs(optimalPose.getByIndex(index, 0) - filteredOutput.getByIndex(index, 0));
        var velocityFiltered = Math.abs(filteredOutput.getByIndex(index, 1));
        if (distanceHoldToFiltered > this.highestDistanceHoldToFiltered) {
            this.highestDistanceHoldToFiltered = distanceHoldToFiltered;
        }
        if (distanceHoldToOptimal > this.highestDistanceHoldToOptimal) {
            this.highestDistanceHoldToOptimal = distanceHoldToOptimal;
        }
        if (distanceOptimalToFiltered > this.highestDistanceOptimalToFiltered) {
            this.highestDistanceOptimalToFiltered = distanceOptimalToFiltered;
        }
        if (velocityFiltered > this.highestVelocityFiltered) {
            this.highestVelocityFiltered = velocityFiltered;
        }
    }
};
module.exports = LookatNodeDistanceReport;

},{}],107:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var Pose = require("../base/Pose");
/**
 *
 * @param {number} [undershootTarget]
 * @constructor
 */
var LookatNodeTargetAdjuster = function (undershootTarget) {
    /**
     * @type {number}
     * @private
     */
    this._undershootTarget = 0;
    if (undershootTarget != null) {
        this._undershootTarget = undershootTarget;
    }
    /**
     * @type {Pose}
     * @private
     */
    this._currentDesiredDelta = new Pose("LNTA Delta");
    var self = this;
    this._absMaxValue = function (dofName, poseData) {
        var limit = self._undershootTarget;
        var result = [];
        if (poseData.length > 0) {
            result[0] = Math.max(-limit, Math.min(limit, poseData[0]));
        }
        return result;
    };
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._lastWorldTarget = null;
};
/**
 *
 * @param {Pose} optimalPose
 * @param {Pose} currentPose
 * @param {Pose} inplaceDelta
 * @param {DOFGlobalAlignment} dofAligner
 * @private
 */
LookatNodeTargetAdjuster.prototype.reComputeDelta = function (optimalPose, currentPose, inplaceDelta, dofAligner) {
    if (dofAligner != null) {
        dofAligner.refineToLocallyClosestTargetPose(currentPose, optimalPose);
    }
    Pose.subtract(currentPose, optimalPose, false, inplaceDelta);
    Pose.computeUnary(inplaceDelta, this._absMaxValue, false, inplaceDelta);
    //console.log("Recomputed target adjustment delta (|"+currentPose+" - "+optimalPose+"|) as:"+inplaceDelta.toString());
};
/**
 * @param {number} newMaxDelta
 */
LookatNodeTargetAdjuster.prototype.setMaxDelta = function (newMaxDelta) {
    this._undershootTarget = newMaxDelta;
    this._lastWorldTarget = null; //trigger a recalculation of the offset
};
/**
 * @param {Pose} optimal
 * @param {Pose} currentPose
 * @param {THREE.Vector3} worldTarget
 * @param {DOFGlobalAlignment} dofAligner
 * @param {Pose} inplaceOutput
 */
LookatNodeTargetAdjuster.prototype.adjustTarget = function (optimal, currentPose, worldTarget, dofAligner, inplaceOutput) {
    if (this._undershootTarget !== 0) {
        //console.log("LookatNodeTargetAdjuster: doing adjustment of "+this._undershootTarget);
        //we only need to operate if we have a non-zero _maxDesiredDelta, otherwise the optimal is the answer
        if (this._lastWorldTarget === null) {
            this._lastWorldTarget = worldTarget.clone();
            //recompute
            this.reComputeDelta(optimal, currentPose, this._currentDesiredDelta, dofAligner);
        }
        else if (this._lastWorldTarget.distanceToSquared(worldTarget) > 0.001) {
            this._lastWorldTarget.copy(worldTarget);
            //recompute
            this.reComputeDelta(optimal, currentPose, this._currentDesiredDelta, dofAligner);
        }
        Pose.add(optimal, this._currentDesiredDelta, false, inplaceOutput);
    }
    else if (optimal !== inplaceOutput) {
        //console.log("LookatNodeTargetAdjuster: doing zero adjustment (copy)");
        //optimal is the answer, as _maxDesiredDelta is zero; if they are not the same instance we must copy it over
        inplaceOutput.setPose(optimal);
    } //else{
    //console.log("LookatNodeTargetAdjuster: doing zero adjustment (passthrough)");
    //}
};
module.exports = LookatNodeTargetAdjuster;

},{"../base/Pose":78}],108:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2017 IF Robots LLC
 */
"use strict";
var Pose = require("../base/Pose");
/**
 *
 * @param {string} generate the report on the update of this dof
 * @param {string[]} dofNamesForIndividualOrientation
 * @param {string[]} additionalStatusDOFs
 * @constructor
 */
var LookatOrientationStatusReporter = function (reportOnDOF, dofNamesForIndividualOrientation, additionalStatusDOFs) {
    this._orientationDOFs = dofNamesForIndividualOrientation;
    this._statusDOFs = additionalStatusDOFs;
    this._inplacePoseCurrent = new Pose("IndividualForwardsCurrent", this._orientationDOFs);
    this._inplacePoseTarget = new Pose("IndividualForwardsTarget", this._orientationDOFs);
    this._orientationDOFIndices = [];
    this._statusDOFIndices = [];
    this._reportOnIndex = this._inplacePoseCurrent.getDOFIndexForName(reportOnDOF);
    var i;
    for (i = 0; i < this._orientationDOFs.length; i++) {
        this._orientationDOFIndices[i] = this._inplacePoseCurrent.getDOFIndexForName(this._orientationDOFs[i]);
    }
    for (i = 0; i < this._statusDOFs.length; i++) {
        this._statusDOFIndices[i] = this._inplacePoseCurrent.getDOFIndexForName(this._statusDOFs[i]);
    }
};
/**
 * Generate the status of the look orientation forwards.  motionLookat MUST have already computed its
 * pose for all dofs in _orientationDOFs.
 *
 * @param {MotionLookat} motionLookat
 * @return {object}
 */
LookatOrientationStatusReporter.prototype.generateStatus = function (motionLookat) {
    var status = {}, i, dof, di;
    motionLookat.getIndividuallyForwardPose(this._inplacePoseTarget, this._inplacePoseCurrent);
    for (i = 0; i < this._orientationDOFIndices.length; i++) {
        dof = this._orientationDOFs[i];
        di = this._orientationDOFIndices[i];
        status[dof] = {
            iForwardCur: this._inplacePoseCurrent.getByIndex(di, 0),
            iForwardTarg: this._inplacePoseTarget.getByIndex(di, 0),
            AtTarget: motionLookat.getHoldReachedForDOFIndex(di),
            Tracking: motionLookat.getIsTrackingForDOFIndex(di)
        };
    }
    for (i = 0; i < this._statusDOFs.length; i++) {
        dof = this._statusDOFs[i];
        di = this._statusDOFIndices[i];
        status[dof] = {
            AtTarget: motionLookat.getHoldReachedForDOFIndex(di),
            Tracking: motionLookat.getIsTrackingForDOFIndex(di)
        };
    }
    return status;
};
/**
 *
 * @param {number} dofIndex
 */
LookatOrientationStatusReporter.prototype.shouldReportOnIndex = function (dofIndex) {
    return dofIndex === this._reportOnIndex;
};
module.exports = LookatOrientationStatusReporter;

},{"../base/Pose":78}],109:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var LookatWindupPolicy = function (targetDeltaToTriggerNewWindup, maxAllowedTriggerSpeed, minAllowedTriggerDistance, maxAllowedTriggerDistance, windupDistanceRatio, windupMinDistance, windupMaxDistance, overshootDistanceRatio, overshootMinDistance, overshootMaxDistance) {
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._lastTarget = null;
    /**
     * @type {number}
     * @private
     */
    this._targetChangedWindupThreshold = targetDeltaToTriggerNewWindup;
    /**
     * @type {WindupOvershootParams}
     * @private
     */
    this._trajectoryParams = {
        maxAllowedTriggerSpeed,
        minAllowedTriggerDistance,
        maxAllowedTriggerDistance,
        windupDistanceRatio,
        windupMinDistance,
        windupMaxDistance,
        overshootDistanceRatio,
        overshootMinDistance,
        overshootMaxDistance
    };
};
/**
 * @param {PoseOffsetFilterWindup} offsetFilter
 */
LookatWindupPolicy.prototype.configureFilter = function (offsetFilter) {
    offsetFilter.configure(this._trajectoryParams);
};
/**
 * Determine whether its an appropriate time to begin a windup type trajectory
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport - distance report
 * @param {TrackMode} trackMode - current tracking mode
 * @param {Time} currentTime - time
 * @param {THREE.Vector3} target - new target
 * @return {boolean} true to begin a windup type trajectory
 */
LookatWindupPolicy.prototype.shouldWindup = function (lookatNodeDistanceReport, trackMode, currentTime, target) {
    var trigger = false;
    if (this._lastTarget === null || this._lastTarget.distanceTo(target) > this._targetChangedWindupThreshold) {
        trigger = true;
        //console.log("LookatWindupPolicy: triggering windup due to "+(this._lastTarget === null?"last target being null":"target change of "+this._lastTarget.distanceTo(target)));
    }
    if (this._lastTarget === null) {
        this._lastTarget = target.clone();
    }
    else {
        this._lastTarget.copy(target);
    }
    return trigger;
};
module.exports = LookatWindupPolicy;

},{}],110:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var Pose = require("../base/Pose");
/**
 *
 * @param {LookatMotionNode[]} lookatNodes - assumed to be in order root to leaf
 * @param {KinematicGroup} kinematicGroupPrototype
 * @constructor
 */
var MotionLookat = function (lookatNodes, kinematicGroupPrototype) {
    var allRequiredDOFs = [];
    var i, j;
    /** @type {LookatMotionNode[]} */
    this._lookatNodes = lookatNodes;
    for (i = 0; i < this._lookatNodes.length; i++) {
        var localGroup = kinematicGroupPrototype.getCopy(kinematicGroupPrototype.getModelControlGroup().getRequiredTransformNamesForDOFs(this._lookatNodes[i].getDOFsNeededInKG()), true);
        this._lookatNodes[i].connectToGroup(localGroup);
        //local group will include all required ancestor dofs
        var dofsForThisLook = localGroup.getDOFNames();
        for (j = 0; j < dofsForThisLook.length; j++) {
            if (allRequiredDOFs.indexOf(dofsForThisLook[j]) < 0) {
                allRequiredDOFs.push(dofsForThisLook[j]);
            }
        }
    }
    /** @type {Pose} */
    this._internalPose = new Pose("LookPose", allRequiredDOFs);
    /** @type {Object.<string,LookatMotionNode>} */
    this._dofToLookatNodeMap = {};
    /** @type {Object.<string,string[]>} */
    this._lookatNodeToDOFsMap = {};
    /**
     * Array indexed by global dof indices
     * @type {LookatMotionNode[]}
     */
    this._dofIndexToLookatNodeMap = [];
    /** @type {Array.<Number[]>} */
    this._lookatNodeIndexToDOFIndices = [];
    for (i = 0; i < this._lookatNodes.length; i++) {
        var lookatNode = this._lookatNodes[i];
        var lookatNodeDOFs = this._lookatNodes[i].getDOFs();
        if (this._lookatNodeToDOFsMap.hasOwnProperty(lookatNode.getName())) {
            throw new Error("Error, multiple lookat nodes named " + lookatNode.getName());
        }
        this._lookatNodeToDOFsMap[lookatNode.getName()] = lookatNodeDOFs;
        this._lookatNodeIndexToDOFIndices[i] = [];
        for (j = 0; j < lookatNodeDOFs.length; j++) {
            var dofName = lookatNodeDOFs[j];
            if (this._dofToLookatNodeMap.hasOwnProperty(dofName)) {
                throw new Error("Error, multiple lookat nodes use DOF " + dofName + ": " + this._dofToLookatNodeMap[dofName].getName() + " and " + lookatNode.getName());
            }
            this._dofToLookatNodeMap[dofName] = lookatNode;
            var dofIndex = this._internalPose.getDOFIndexForName(dofName);
            this._dofIndexToLookatNodeMap[dofIndex] = lookatNode;
            this._lookatNodeIndexToDOFIndices[i].push(dofIndex);
        }
    }
};
/**
 * Updates state to time, tracking target.
 *
 * @param {Pose} poseCurrentPose - should contain at least nodes of relevance to the computation, e.g. ancestor nodes (and lookat node, if we are initializing after reset)
 * @param {Pose} poseInplaceOut - output values will be stored here (output values unchanged "poseCurrentPose" for unused dofs, preset poseInplaceOut to poseCurrentPose if full pose is to be used)
 * @param {THREE.Vector3} target - target in world space
 * @param {Time} time - time to generate pose for
 */
MotionLookat.prototype.generatePose = function (poseCurrentPose, poseInplaceOut, target, time) {
    //if(poseCurrentPose!==poseInplaceOut) {
    //	poseInplaceOut.setPose(poseCurrentPose);
    //}
    //use _internalPose instead of poseInplaceOutput in case it doesn't have required "state" dofs
    this._internalPose.setPose(poseCurrentPose);
    for (var i = 0; i < this._lookatNodes.length; i++) {
        this._lookatNodes[i].update(this._internalPose, this._internalPose, target, time);
    }
    poseInplaceOut.setPose(this._internalPose);
};
/**
 * Updates state to time, tracking target.  Only updates the lookat node related to the dof provided.
 * For lookat nodes that control multiple dofs, we rely on the the underlying LookatMotionNodes
 * to cache results and return the same computation again for 2 calls at the same "time".  poseInplaceOut
 * will have results of all dofs for that multi-dof node when any of it's nodes are specified (unless
 * the Pose does not contain those dofs)
 *
 * Caller must take care to update dofs in order (base to leaf), and to not skip dofs that
 * will later be used again before the next reset, as their state tracking will become out
 * of sync.  They must also take care to update all DOFs in use before calling status calls
 * like getDistanceRemaining().
 *
 * @param {Pose} poseCurrentPose - should contain at least nodes of relevance to the computation, e.g. ancestor nodes (and lookat node, if we are initializing after reset)
 * @param {Pose} poseInplaceOut - output values will be stored here (output values unchanged "poseCurrentPose" for unused dofs, preset poseInplaceOut to poseCurrentPose if full pose is to be used)
 * @param {THREE.Vector3} target - target in world space
 * @param {Time} time - time to generate pose for
 * @param {number} dofIndex - only generate state for this dof (if we have no node for this dof, poseInplaceOut will just be poseCurrentPose)
 */
MotionLookat.prototype.generatePoseIncremental = function (poseCurrentPose, poseInplaceOut, target, time, dofIndex) {
    //if(poseCurrentPose!==poseInplaceOut) {
    //	poseInplaceOut.setPose(poseCurrentPose);
    //}
    var node = this._dofIndexToLookatNodeMap[dofIndex];
    node.update(poseCurrentPose, poseInplaceOut, target, time);
};
/**
 * Get the most recently computed pose, without updating any state.  This is only valid once initialized
 * via generatePoseIncremental or generatePose have been called (after initial construction or any reset).
 *
 * @param {Pose} poseInplaceOut
 */
MotionLookat.prototype.getPose = function (poseInplaceOut) {
    for (var i = 0; i < this._lookatNodes.length; i++) {
        var indicesForNode = this._lookatNodeIndexToDOFIndices[i];
        var lookatNode = this._lookatNodes[i];
        //only ask nodes that are in our poseInplaceOut
        for (var j = 0; j < indicesForNode.length; j++) {
            if (poseInplaceOut.hasDOFIndex(indicesForNode[j])) {
                lookatNode.getPose(poseInplaceOut);
                break;
            }
        }
    }
};
/**
 * Get the individual forward information for the last computed Pose, does not update state.  This is
 * only valid once initialized via generatePoseIncremental or generatePose have been called (after initial
 * construction or any reset).
 *
 * @param {Pose} inplaceAtTarget - provide the forward vals here (a dof will be cleared out if unavailable).  may be null or have incomplete dofs.
 * @param {Pose} inplaceAtCurrent - provide the forward vals at current position (e.g., in progress to target), a dof will by cleared out if unavailable).  may be null or have incomplete dofs.
 */
MotionLookat.prototype.getIndividuallyForwardPose = function (inplaceAtTarget, inplaceAtCurrent) {
    for (var i = 0; i < this._lookatNodes.length; i++) {
        var indicesForNode = this._lookatNodeIndexToDOFIndices[i];
        var lookatNode = this._lookatNodes[i];
        //only ask nodes that are in our poseInplaceOut
        for (var j = 0; j < indicesForNode.length; j++) {
            if ((inplaceAtTarget !== null && inplaceAtTarget.hasDOFIndex(indicesForNode[j])) ||
                (inplaceAtCurrent !== null && inplaceAtCurrent.hasDOFIndex(indicesForNode[j]))) {
                lookatNode.getIndividuallyForwardPose(inplaceAtTarget, inplaceAtCurrent);
                break;
            }
        }
    }
};
/**
 * Produces the optimal lookat pose, regardless of current state/time.  Does not update state.  Does not apply
 * LookatNodeTargetAdjuster
 *
 * @param {Pose} poseCurrentPose - should contain at least nodes of relevance to the computation, e.g. ancestor nodes
 * @param {Pose} poseInplaceOut - output values will be stored here
 * @param {THREE.Vector3} target - target in world space
 */
MotionLookat.prototype.getOptimalPose = function (poseCurrentPose, poseInplaceOut, target) {
    if (poseCurrentPose !== poseInplaceOut) {
        poseInplaceOut.setPose(poseCurrentPose);
    }
    //use _internalPose instead of poseInplaceOutput in case it doesn't have required state dofs
    this._internalPose.setPose(poseCurrentPose);
    for (var i = 0; i < this._lookatNodes.length; i++) {
        this._lookatNodes[i].getOptimalPose(this._internalPose, this._internalPose, target);
    }
    poseInplaceOut.setPose(this._internalPose);
};
/**
 * Get the distance remaining for this lookat to travel to the current target.  Does not advance (use update())
 * This value is computed from the data calculated in the last generatePose() call.  The value is the maximum
 * distance remaining for any DOF used in this lookat.
 *
 * @param {string[]} [dofNames] - only count distance on lookats that contain at least one of these dofs.  all nodes checked if omitted/null
 * @return {number} distance of dof with largest remaining distance (as ratio of current distance of total range of LookatDOF)
 */
MotionLookat.prototype.getDistanceRemaining = function (dofNames) {
    var i;
    var d;
    var maxD = 0;
    if (dofNames == null) {
        for (i = 0; i < this._lookatNodes.length; i++) {
            d = this._lookatNodes[i].getDistanceRemaining();
            if (d > maxD) {
                maxD = d;
            }
        }
    }
    else {
        var processed = {};
        for (i = 0; i < dofNames.length; i++) {
            var dofName = dofNames[i];
            if (this._dofToLookatNodeMap.hasOwnProperty(dofName)) {
                var node = this._dofToLookatNodeMap[dofName];
                if (processed[node.getName()] !== true) {
                    d = node.getDistanceRemaining();
                    if (d > maxD) {
                        maxD = d;
                    }
                    processed[node.getName()] = true;
                }
            }
        }
    }
    return maxD;
};
/**
 * True if hold is reached on all dofs selected by the mask argument.
 * Mask argument is indexed by global DOF indices, and a true indicates
 * that the dof at that index is present (and should be included in the hold check)
 *
 * Null mask means check all
 *
 * @param {boolean[]} presenceMask
 */
MotionLookat.prototype.getHoldReached = function (presenceMask) {
    var i, j;
    var holdingAll = true;
    var lookatNodes = this._lookatNodes;
    if (presenceMask == null) {
        for (i = 0; i < lookatNodes.length; i++) {
            if (!lookatNodes[i].getInHoldMode()) {
                holdingAll = false;
                break;
            }
        }
    }
    else {
        var includeNode;
        var indicesForNode;
        var lookatNode;
        for (i = 0; i < lookatNodes.length; i++) {
            includeNode = false;
            indicesForNode = this._lookatNodeIndexToDOFIndices[i];
            lookatNode = this._lookatNodes[i];
            for (j = 0; j < indicesForNode.length; j++) {
                if (presenceMask[indicesForNode[j]]) {
                    includeNode = true;
                    break;
                }
            }
            if (includeNode && !lookatNode.getInHoldMode()) {
                holdingAll = false;
                break;
            }
        }
    }
    return holdingAll;
};
/**
 * True if hold is reached on node related to provided dof index.  data relates to last
 * update of the lookatnode
 *
 * @param {number} dofIndex
 * @return {?boolean}
 */
MotionLookat.prototype.getHoldReachedForDOFIndex = function (dofIndex) {
    var lookatNode = this._dofIndexToLookatNodeMap[dofIndex];
    if (lookatNode !== undefined) {
        return lookatNode.getInHoldMode();
    }
    else {
        return null;
    }
};
/**
 * True if hold is node related to provided dof index is in tracking mode.
 * data relates to last update of the node.
 *
 * @param {number} dofIndex
 * @return {?boolean}
 */
MotionLookat.prototype.getIsTrackingForDOFIndex = function (dofIndex) {
    var lookatNode = this._dofIndexToLookatNodeMap[dofIndex];
    if (lookatNode !== undefined) {
        return lookatNode.getInTrackMode();
    }
    else {
        return null;
    }
};
/**
 * @return {string[]} dof names that can be affected by this lookat
 */
MotionLookat.prototype.getDOFs = function () {
    var dofNames = [];
    for (var i = 0; i < this._lookatNodes.length; i++) {
        dofNames = dofNames.concat(this._lookatNodes[i].getDOFs());
    }
    return dofNames;
};
/**
 * @returns {Array.<string>} all dof names that this lookat affects, or that can affect this lookat (ancestors)
 */
MotionLookat.prototype.getStateDOFs = function () {
    return this._internalPose.getDOFNames();
};
MotionLookat.prototype.reset = function () {
    for (var i = 0; i < this._lookatNodes.length; i++) {
        this._lookatNodes[i].reset();
    }
};
module.exports = MotionLookat;

},{"../base/Pose":78}],111:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var Pose = require("../base/Pose");
var THREE = require("@jibo/three");
var LookatNode = require("./LookatNode");
/**
 *
 * @param {LookatNode} lookatNode
 * @param {DOFGlobalAlignment} dofAligner
 * @constructor
 */
var OcularStabilizationTracker = function (lookatNode, dofAligner) {
    /** @type {boolean} */
    var initialized = false;
    /** @type {THREE.Vector3} */
    var lastTargetWorldSpace = new THREE.Vector3();
    /** @type {string[]} */
    var dofNamesInUse = lookatNode.getDOFs();
    /** @type {Pose} */
    var lastOptimalPoseForLastTarget = new Pose(lookatNode.getName() + " Last Optimal", dofNamesInUse);
    /** @type {Pose} */
    var newOptimalPoseForLastTarget = new Pose(lookatNode.getName() + " Stepped Pose", dofNamesInUse);
    /** @type {Pose} */
    var deltaPoseFromLastTime = new Pose(lookatNode.getName() + " OST Delta", dofNamesInUse);
    /** @type {Pose} */
    var decompLastPoseOptimal = new Pose(lookatNode.getName() + " Temp Last Pose Optimal", dofNamesInUse);
    /** @type {Pose} */
    var decompLastPose = null; //init with correct nodes when first used.
    /**
     *
     * @param {Pose} currentPose
     * @param {Pose} optimalPoseForCurrentTarget
     * @param {THREE.Vector3} currentTarget
     * @returns {Pose}
     */
    this.computeStabilizationDelta = function (currentPose, optimalPoseForCurrentTarget, currentTarget) {
        if (initialized) {
            var reusedOptimal = false;
            var report = null;
            if (lastTargetWorldSpace.equals(currentTarget)) {
                newOptimalPoseForLastTarget.setPose(optimalPoseForCurrentTarget);
                reusedOptimal = true;
            }
            else {
                report = new LookatNode.PointNodeReport();
                lookatNode.getPose(currentPose, newOptimalPoseForLastTarget, lastTargetWorldSpace, null, report, lastOptimalPoseForLastTarget);
            }
            if (reusedOptimal || report._pointSucceeded) {
                if (dofAligner != null) {
                    dofAligner.refineToLocallyClosestTargetPose(lastOptimalPoseForLastTarget, newOptimalPoseForLastTarget);
                }
                Pose.subtract(newOptimalPoseForLastTarget, lastOptimalPoseForLastTarget, true, deltaPoseFromLastTime);
            }
            else {
                //can't do anything with newOptimal; we'll report zero delta
                var dofIndicesToZero = deltaPoseFromLastTime.getDOFIndices();
                for (var r = 0; r < dofIndicesToZero.length; r++) {
                    deltaPoseFromLastTime.setByIndex(dofIndicesToZero[r], 0, 0);
                }
            }
        }
        else {
            deltaPoseFromLastTime.clear();
            for (var f = 0; f < dofNamesInUse.length; f++) {
                deltaPoseFromLastTime.set(dofNamesInUse[f], 0, 0); //start off with zero delta
            }
        }
        lastTargetWorldSpace.copy(currentTarget);
        if (optimalPoseForCurrentTarget == null) {
            //if it is not provided, we must calculate it here.
            lookatNode.getPose(currentPose, lastOptimalPoseForLastTarget, currentTarget, null, null, initialized ? lastOptimalPoseForLastTarget : null);
        }
        else {
            lastOptimalPoseForLastTarget.setPose(optimalPoseForCurrentTarget);
        }
        initialized = true;
        return deltaPoseFromLastTime;
    };
    /**
     * This function computes the portion of each node's velocity that is used to stabilize it against
     * parent motion (e.g., the portion that would be produced by computeStabilizationDelta).  It then subtracts
     * that portion off, and returns the remainder which represents the post-stabilized (~world-space) motion of the node.
     * These velocities are computed for each dof used by this node, and provided through the inplacePostStabilizationPose
     * argument.
     *
     * @param {Pose} currentPose - current pose and velocities (can be same as inplacePostStabilizationPose)
     * @param {Pose} inplacePostStabilizationPose - inplace argument to receive computed velocities (other values unchanged)
     * @param {THREE.Vector3} target - stabilize with respect to this target
     * @param {number} [rejectionVelocityThreshold=0] - limit the velocity component related to stabilization to this value (0 means no limit)
     */
    this.decomposeVelocity = function (currentPose, inplacePostStabilizationPose, target, rejectionVelocityThreshold) {
        if (rejectionVelocityThreshold == null) {
            rejectionVelocityThreshold = 0;
        }
        if (decompLastPose === null) {
            decompLastPose = new Pose(lookatNode.getName() + " Decomp Last Pose");
        }
        Pose.advanceByTime(currentPose, true, decompLastPose, -1 / 50.0);
        lookatNode.getPose(currentPose, newOptimalPoseForLastTarget, target, null, null, null);
        lookatNode.getPose(decompLastPose, decompLastPoseOptimal, target, null, null, newOptimalPoseForLastTarget);
        if (dofAligner != null) {
            dofAligner.refineToLocallyClosestTargetPose(decompLastPoseOptimal, newOptimalPoseForLastTarget);
        }
        Pose.subtract(newOptimalPoseForLastTarget, decompLastPoseOptimal, true, deltaPoseFromLastTime);
        var dofIndices = deltaPoseFromLastTime.getDOFIndices();
        for (var i = 0; i < dofIndices.length; i++) {
            var index = dofIndices[i];
            var originalVelocity = currentPose.getByIndex(index, 1);
            var deltaComponent = deltaPoseFromLastTime.getByIndex(index, 0);
            var stabilizationVelocity = deltaComponent * 50;
            if (rejectionVelocityThreshold !== 0 && Math.abs(stabilizationVelocity) > rejectionVelocityThreshold) {
                slog.error("Clamping OST application of stabilization velocity of " + stabilizationVelocity + " to " + deltaPoseFromLastTime.getDOFNameForIndex(index) + " as it is greater than " + rejectionVelocityThreshold);
                if (stabilizationVelocity < 0) {
                    stabilizationVelocity = -rejectionVelocityThreshold;
                }
                else {
                    stabilizationVelocity = rejectionVelocityThreshold;
                }
            }
            inplacePostStabilizationPose.setByIndex(index, originalVelocity - stabilizationVelocity, 1);
        }
    };
    /**
     * Reset between tracking sessions, so the first frame of a new track isn't treated
     * as part of the last tracking (with a large jump).  When computeStabilizationDelta is
     * called multiple times in a row with no intervening reset, it is assumed to be part of
     * a single stabilization session.
     */
    this.reset = function () {
        initialized = false;
    };
};
module.exports = OcularStabilizationTracker;

},{"../../ifr-core/SLog":57,"../base/Pose":78,"./LookatNode":105,"@jibo/three":undefined}],112:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2017 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var ExtraMath = require("../../ifr-geometry/ExtraMath");
var ConeMath = require("./ConeMath");
var CyclicMath = require("../base/CyclicMath");
//TODO: consolidate with LookatDOF
/**
 * Enum Values for look solution policy when multiple solutions are possible.
 * @enum {string}
 */
var SOLUTION_POLICY = {
    /**
     * Don't modify solution, arbitrary polarity
     */
    NATURAL: "NATURAL",
    /**
     * Closest solution
     */
    CLOSEST: "CLOSEST",
    /**
     * Farthest solution (farthest from "current" when no lastProduced, then closest to lastProduced when provided)
     */
    FARTHEST: "FARTHEST"
};
/**
 * @type {GLKinematicVis}
 */
var visHelper = null;
/**
 *
 * @param {string} name - my name
 * @param {string} orientDOFName  - name of the orientDOF.  ancestor of tiltDOF, will be used to point correct part of oriented plane towards target
 * @param {string} tiltDOFName - name of tiltDOF.  descendant of orientDOF, ancestor of swivelDOF.  will be used to tilt the plane to correct angle for target w.r.t. orientAxis
 * @param {string} swivelDOFName - name of swivelDOF.  descendant of tiltDOF.  swivelAxis defines the plane we are manipulating.
 * @param {number} orientDOFValueMinForward - the value of orientDOF when the system is in the "min" position facing forwards (swivelAxis max far from orientAxis in the forward direction)
 * @param {number} tiltDOFValueMinForward - the value of tiltDOF when the system is in the "min" position facing forwards (swivelAxis max far from orientAxis in the forward direction)
 * @param {number} heightAbovePlane - height to view plane
 * @param {number} angleAbovePlane - angle of view plane above plane
 * @param {boolean} forbidTilt - don't produce any poses with tilt (none from middle zone)
 * @param {SOLUTION_POLICY} solutionPolicy - choose a policy to resolve multiple solutions
 * @param {number} rigidSwingArmFactor - null/undefined to use classical strategy. 0-1 to use rigid-swing-arm strategy, value controls length of arm (1 = full length) (see computeNeckPlaneAngle)
 * @constructor
 */
var PlaneAlignmentWithRollLookatDOF = function (name, orientDOFName, tiltDOFName, swivelDOFName, orientDOFValueMinForward, tiltDOFValueMinForward, heightAbovePlane, angleAbovePlane, forbidTilt, solutionPolicy, rigidSwingArmFactor) {
    /**
     * @type {string}
     * @private
     */
    this._name = name;
    /**
     * @type {string}
     * @private
     */
    this._orientDOFName = orientDOFName;
    /**
     * @type {string}
     * @private
     */
    this._tiltDOFName = tiltDOFName;
    /**
     * @type {string}
     * @private
     */
    this._swivelDOFName = swivelDOFName;
    /**
     * @type {number}
     * @private
     */
    this._orientDOFValueMinForward = orientDOFValueMinForward;
    /**
     * Max is opposite of Min in this geometry
     * @type {number}
     * @private
     */
    this._orientDOFValueMaxForward = orientDOFValueMinForward + Math.PI;
    /**
     * @type {number}
     * @private
     */
    this._tiltDOFValueMinForward = tiltDOFValueMinForward;
    /**
     * Max is opposite of Min in this geometry
     * @type {number}
     * @private
     */
    this._tiltDOFValueMaxForward = tiltDOFValueMinForward + Math.PI;
    /**
     * Direction of rotation following an upwards moving target in zone C1 (lower range cone-zone) (1 for RHR around vertical)
     * @type {number}
     * @private
     */
    this._directionZoneC1 = 1;
    /**
     * Direction of rotation following an upwards moving target in zone C2 (upper range cone-zone) (1 for RHR around vertical)
     * @type {number}
     * @private
     */
    this._directionZoneC2 = 1;
    /**
     * Direction of rotation following an upwards moving target in zone M (mid range between the cone-zones) (1 for RHR around vertical)
     * @type {number}
     * @private
     */
    this._directionZoneM = 1;
    /**
     * @type {ConeMath}
     * @private
     */
    this._coneMath = new ConeMath();
    /**
     * @type {KinematicGroup}
     * @private
     */
    this._kinematicGroup = null;
    /**
     * @type {THREE.Object3D}
     * @private
     */
    this._orientTransform = null;
    /**
     * @type {THREE.Object3D}
     * @private
     */
    this._tiltTransform = null;
    /**
     * @type {THREE.Object3D}
     * @private
     */
    this._swivelTransform = null;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._orientAxisLocal = null;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._tiltAxisLocal = null;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._swivelAxisLocal = null;
    /**
     * @type {number}
     * @private
     */
    this._tiltConeAngle = 0;
    /**
     * Pivot in the center of head; direction from this pivot to target gives a vertical
     * angle for face, discounting translation
     * @type {THREE.Vector3}
     * @private
     */
    this._headCenterPivot = null;
    /**
     * Pivot in neck area; used to compute better vertical angle than headCenterPivot,
     * treats face plane as if rigidly connected to this pivot, translation partially
     * accounted for.
     *
     * @type {THREE.Vector3}
     * @private
     */
    this._neckCenterPivot = null;
    /**
     * @type {number}
     * @private
     */
    this._orientAxisToTiltAxisAngle = 0;
    /**
     * @type {number}
     * @private
     */
    this._zone1Min = 0;
    /**
     * @type {number}
     * @private
     */
    this._zone1Max = 0;
    /**
     * @type {number}
     * @private
     */
    this._angleAbovePlane = angleAbovePlane;
    /**
     * @type {number}
     * @private
     */
    this._heightAbovePlane = heightAbovePlane;
    /**
     * true to disallow zone with tilt
     * @type {boolean}
     * @private
     */
    this._forbidTilt = false;
    if (forbidTilt != null) {
        this._forbidTilt = forbidTilt;
    }
    this._rigidSwingArmFactor = rigidSwingArmFactor;
    if (this._rigidSwingArmFactor === undefined) {
        this._rigidSwingArmFactor = null;
    }
    this._solutionPolicy = SOLUTION_POLICY.NATURAL;
    if (solutionPolicy != null) {
        this._solutionPolicy = solutionPolicy;
    }
    /**
     * percent of tilt zone to use as hysteresis area
     * 1 means don't swap to new position until you're entirely through the zone
     * 0 means use whichever solution is closer always
     * @type {number}
     * @private
     */
    this._forbibTiltHysteresis = 0.5;
    //need:
    //base rot (z), targetNormal
    //torsoConeAngle
    //coneDelta, comes from baseRot, torsoConeAngle
    //min/max targetCone zone (comes from coneDelta and torsoConeAngle
    //baseRotCorrespondingToMin (e.g., the dof position of the base dof when headRot is maximally pushed away from baseRot)
    //torsoRotCorrespondingToMin (e.g., the dof position of the torso dof when the headRot is maximally pushed away from baseRot)
};
PlaneAlignmentWithRollLookatDOF.SOLUTION_POLICY = SOLUTION_POLICY;
/**
 * Static installation of visHelper to enable kinematic vis for debugging
 * @param {GLKinematicVis} useVisHelper
 */
PlaneAlignmentWithRollLookatDOF.setVisHelper = function (useVisHelper) {
    visHelper = useVisHelper;
};
/**
 * @param {KinematicGroup} kinematicGroup group to use for kinematic math (assumed to be configured as desired before valToPointAtTarget calls)
 */
PlaneAlignmentWithRollLookatDOF.prototype.connectToGroup = function (kinematicGroup) {
    this._kinematicGroup = kinematicGroup;
    if (this._kinematicGroup) {
        var modelControlGroup = kinematicGroup.getModelControlGroup();
        var orientControl = modelControlGroup.getControlForDOF(this._orientDOFName);
        var tiltControl = modelControlGroup.getControlForDOF(this._tiltDOFName);
        var swivelControl = modelControlGroup.getControlForDOF(this._swivelDOFName);
        this._orientTransform = kinematicGroup.getTransform(orientControl.getTransformName());
        this._tiltTransform = kinematicGroup.getTransform(tiltControl.getTransformName());
        this._swivelTransform = kinematicGroup.getTransform(swivelControl.getTransformName());
        kinematicGroup.updateWorldCoordinateFrames();
        this._orientAxisLocal = orientControl.getRotationalAxis(null);
        this._tiltAxisLocal = tiltControl.getRotationalAxis(null);
        this._swivelAxisLocal = swivelControl.getRotationalAxis(null);
        this._orientAxisGlobal = ExtraMath.convertDirectionLocalToWorld(this._orientTransform, this._orientAxisLocal, null);
        var tiltAxisGlobal = ExtraMath.convertDirectionLocalToWorld(this._tiltTransform, this._tiltAxisLocal, null);
        var swivelAxisGlobal = ExtraMath.convertDirectionLocalToWorld(this._swivelTransform, this._swivelAxisLocal, null);
        this._tiltConeAngle = tiltAxisGlobal.angleTo(swivelAxisGlobal);
        this._neckCenterPivot = this._orientTransform.localToWorld(new THREE.Vector3());
        this._neckCenterPivot.projectOnVector(this._orientAxisGlobal);
        this._headCenterPivot = this._neckCenterPivot.clone();
        //move _neckCenterPivot according to our _rigidSwingArmFactor; at 1, we have the full arm, at 0 we have no arm (e.g., pivot is in head)
        this._neckCenterPivot.add(this._orientAxisGlobal.clone().setLength((1 - this._rigidSwingArmFactor) * this._heightAbovePlane));
        //TODO: doing this in global space because I know we aren't moving these
        if (this._heightAbovePlane !== 0) {
            this._headCenterPivot = this._orientAxisGlobal.clone().setLength(this._heightAbovePlane).add(this._headCenterPivot);
            //var transVec = new THREE.Vector3().copy(rotatedAxis);
            //transVec.multiplyScalar(distanceAlongDOFAxisToPlane / transVec.length());
            //localTarget.sub(transVec);
        }
        this._orientAxisToTiltAxisAngle = tiltAxisGlobal.angleTo(this._orientAxisGlobal);
        this._zone1Min = Math.abs(this._orientAxisToTiltAxisAngle - this._tiltConeAngle);
        this._zone1Max = this._orientAxisToTiltAxisAngle + this._tiltConeAngle;
    }
    else {
        this._orientTransform = null;
        this._tiltTransform = null;
        this._swivelTransform = null;
        this._orientAxisLocal = null;
        this._tiltAxisLocal = null;
        this._swivelAxisLocal = null;
        this._orientAxisGlobal = null;
        this._tiltConeAngle = 0;
        this._headCenterPivot = null;
        this._neckCenterPivot = null;
        this._orientAxisToTiltAxisAngle = 0;
        this._zone1Min = 0;
        this._zone1Max = 0;
    }
};
/**
 * Compute the angle to the neck plane from orientAxisGlobal to point face at the right height for target.
 *
 * This is an approximation to avoid any need to iterate; desired angle is computed as if the face-plane is
 * connected rigidly to a 360 pivot located at orientTransform; that motion does not have exactly the same translation
 * as the face plane, but it is closer than leaving it in place translation-wise.
 *
 * @param {THREE.Vector3} target
 * @return {number} angle from orientAxisGlobal to the neck-plane that would cause the face to point at the target
 */
PlaneAlignmentWithRollLookatDOF.prototype.computeNeckPlaneAngle = function (target) {
    var usePivot = this._neckCenterPivot;
    var pivotToTarget = target.clone().sub(usePivot);
    var pivotToFaceRayOrigin = this._heightAbovePlane * this._rigidSwingArmFactor;
    var insideAnglePlaneNormalFaceRay = this._angleAbovePlane + Math.PI / 2.0; // we want interior angle from vertical, not from horizontal
    var distanceToTarget = pivotToTarget.length();
    var epsilon = 0.0000001;
    //Computation of certain solutions are technically impossible (target too close, inside the swing of the
    // swing-arm), but, we can produce answers that look ok and are continuous at the boundary with the
    // technically correct answers.  A 1 here means no inexact answers, and a zero would mean always
    // try to approximate.
    var extendedAnswersInsideSwingAreaRatio = 0.33;
    //this is now an ASS triangle.  points(interior_angle,opposite_side): neckPivot(A,a), faceRayOrigin(center head)(B,b), target(C,c)
    // we assume that B is obtuse (otherwise we'd need to account for the possibility of 2 solutions)
    //  b/sin(B) = c/sin(C)            //law of sines
    //  C = asin(c*sin(B)/b)           //isolate
    //  a = PI - asin(c*sin(B)/b) - B  //PIr in a triangle
    var approx = false;
    var a;
    if (distanceToTarget > pivotToFaceRayOrigin + epsilon) {
        //regular computation
        var angleC = Math.asin(pivotToFaceRayOrigin * Math.sin(insideAnglePlaneNormalFaceRay) / distanceToTarget);
        a = Math.PI - angleC - insideAnglePlaneNormalFaceRay;
    }
    else if (distanceToTarget > pivotToFaceRayOrigin * extendedAnswersInsideSwingAreaRatio) {
        //we'll allow answers in this range; they can't actually point the effector at the target,
        //setting a to zero should be continuous with the real solutions at the boundary,
        //and will result in answers in the approximately expected area.
        a = 0;
        approx = true;
    }
    else {
        //too close, inside the "swing" of the head, cannot compute.
        return Number.NaN;
    }
    //a is the inside angle of the triangle, but we want the angle from vertical.
    //this will be the "angle from vertical to the target" - a;
    var localTargetToVertical = pivotToTarget.angleTo(this._orientAxisGlobal);
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        var color = new THREE.Color(approx ? 0.7 : 0, 0, approx ? 0 : 0.7);
        visHelper.drawLineWorld(this, "NeckPlaneTriangle:Target", usePivot, target, color);
        var usingHeadCenter = pivotToTarget.clone().setLength(pivotToFaceRayOrigin);
        var rotAxis = pivotToTarget.clone().cross(this._orientAxisGlobal).normalize();
        usingHeadCenter.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(rotAxis, a));
        usingHeadCenter.add(usePivot);
        visHelper.drawLineWorld(this, "NeckPlaneTriangle:Vert", usePivot, usingHeadCenter, color);
        visHelper.drawLineWorld(this, "NeckPlaneTriangle:Face", usingHeadCenter, target, color);
    }
    return localTargetToVertical - a;
};
/**
 * Convert world space target to "local" target in neck space, pre-adjusted to account for face distance above the neck plane
 * and face angle.  (e.g., neck plane should try to intersect the returned local)
 *
 * @param target
 * @param result
 * @returns {*}
 */
PlaneAlignmentWithRollLookatDOF.prototype.convertToLocal = function (target, result) {
    //TODO: doing this in global space because I know we aren't moving these
    //we need: pivot point center of neck plane
    //height from center neck to center head
    //angle between vertical and face normal
    var usePivot = this._headCenterPivot;
    if (result === null) {
        result = new THREE.Vector3();
    }
    result.copy(target);
    result.sub(usePivot);
    //move localTarget to account for cone angle above plane
    if (this._angleAbovePlane !== 0) {
        var bendForPlaneModAxis = new THREE.Vector3().crossVectors(this._orientAxisGlobal, result).normalize();
        //applyAxisAngle REQUIRES normalize axis!!
        result.applyAxisAngle(bendForPlaneModAxis, this._angleAbovePlane);
    }
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        visHelper.drawRayWorld(this, "TargetPlane:Normal", usePivot, this._orientAxisGlobal, new THREE.Color(1, 1, 1));
        visHelper.drawConeWorld(this, "TargetPlane:Surface", usePivot, this._orientAxisGlobal, this._angleAbovePlane, new THREE.Color(1, 0, 1));
    }
    return result;
};
/**
 * returns true if the first orient/tilt are closer to Pose than the second
 * @param {Pose} pose
 * @param {number} orient1
 * @param {number} tilt1
 * @param {number} orient2
 * @param {number} tilt2
 * @param {number} rotValue
 * @return {boolean}
 */
PlaneAlignmentWithRollLookatDOF.prototype.firstOrientTiltAreCloser = function (pose, orient1, tilt1, orient2, tilt2, rotValue) {
    var curOrient = pose.get(this._orientDOFName, 0) - rotValue;
    var curTilt = pose.get(this._tiltDOFName, 0);
    var d1 = Math.abs(curOrient - CyclicMath.closestEquivalentRotation(orient1, curOrient)) + Math.abs(curTilt - CyclicMath.closestEquivalentRotation(tilt1, curTilt));
    var d2 = Math.abs(curOrient - CyclicMath.closestEquivalentRotation(orient2, curOrient)) + Math.abs(curTilt - CyclicMath.closestEquivalentRotation(tilt2, curTilt));
    return d1 <= d2;
};
/**
 * given 1 correct solution for orient/tilt, return the solution (1 of the 2 possible) that matches the policy and situation
 *
 * @param {Pose} currentPose
 * @param {Pose} lastProduced - the last pose we computed, or null if this is to be computed as a new series
 * @param {number} orient
 * @param {number} tilt
 * @param {number} rotValue
 * @returns {number[]}
 */
PlaneAlignmentWithRollLookatDOF.prototype.resolveMultiple = function (currentPose, lastProduced, orient, tilt, rotValue) {
    var asIs;
    if (this._solutionPolicy === SOLUTION_POLICY.NATURAL) {
        asIs = true;
    }
    else if (this._solutionPolicy === SOLUTION_POLICY.CLOSEST) {
        asIs = this.firstOrientTiltAreCloser(currentPose, orient, tilt, -orient, -tilt, rotValue);
    }
    else if (this._solutionPolicy === SOLUTION_POLICY.FARTHEST) {
        if (lastProduced) {
            //we want to stay closest to lastProduced, we are in steady state follow/continue
            asIs = this.firstOrientTiltAreCloser(lastProduced, orient, tilt, -orient, -tilt, rotValue);
        }
        else {
            //we want to go farthest from currentPose, we are in the init state
            asIs = !this.firstOrientTiltAreCloser(currentPose, orient, tilt, -orient, -tilt, rotValue);
        }
    }
    if (asIs) {
        return [orient, tilt];
    }
    else {
        return [-orient, -tilt];
    }
};
/**
 *
 * @param {THREE.Vector3} target
 * @param pointReport
 * @param {Pose} currentPose
 * @param {number} rotValue - used to help with hysteresis
 * @param {Pose} lastProduced - the last pose we (the whole node, including rotValue) computed, or null if this is to be computed as the start of a new series
 * @returns {number[]}
 */
PlaneAlignmentWithRollLookatDOF.prototype.valsToPointAtTarget = function (target, pointReport, currentPose, rotValue, lastProduced) {
    if (this._orientAxisGlobal === null) {
        console.log("PlaneAlignmentWithRollLookatDOF being used but not connected to a hierarchy!");
        return null;
    }
    var targetPerpConeAngle;
    if (this._rigidSwingArmFactor !== null) {
        targetPerpConeAngle = this.computeNeckPlaneAngle(target);
    }
    else {
        var pivotToTarget = this.convertToLocal(target, null);
        //want angle between plane normal and target normal, should be == angle - 90 for this case
        //e.g., angle from (the up-facing normal perpendicular to the target vec) to (0,0,1)
        targetPerpConeAngle = pivotToTarget.angleTo(this._orientAxisGlobal) - Math.PI / 2;
    }
    if (!Number.isFinite(targetPerpConeAngle)) {
        //didn't get a real angle, we have no solution
        return null;
    }
    var useTilt = NaN, useOrient = NaN, dirs;
    var epsilon = 0.0000001;
    //select the correct zone.
    //zoneC1 - using roll control in the "min" zone
    //zoneC2 - using roll control in the "max" zone
    //zoneM - cannot do roll control, using min roll
    ////pastMin - we're past the minimum achievable, use min achievable
    ////pastMax - we're past the maximum achievable, use max achievable
    if (targetPerpConeAngle > this._zone1Max - epsilon) {
        useTilt = this._tiltDOFValueMinForward;
        useOrient = this._orientDOFValueMinForward;
    }
    else if (targetPerpConeAngle < -this._zone1Max + epsilon) {
        useTilt = this._tiltDOFValueMinForward; //max system value has min here since it's a local value, and we flipping the whole system
        useOrient = this._orientDOFValueMaxForward;
    }
    else if (targetPerpConeAngle <= this._zone1Min + epsilon && targetPerpConeAngle >= -this._zone1Min - epsilon) {
        var gotRot;
        if (this._forbidTilt) {
            //we only want fully level-head. BUT we must choose which end to be at
            var hysteresisLow = -this._zone1Min * this._forbibTiltHysteresis;
            var hysteresisHigh = this._zone1Min * this._forbibTiltHysteresis;
            if (targetPerpConeAngle >= hysteresisHigh) {
                gotRot = 0;
            }
            else if (targetPerpConeAngle <= hysteresisLow) {
                gotRot = Math.PI;
            }
            else {
                //we're in the hysteresis zone!  choose the one closes to current based on tilt dof
                //subtract off rotValue to get our current orientDOF value
                var curOrientDOFVal = currentPose.get(this._orientDOFName, 0) - rotValue;
                //useOrient orient to be originating gotRot (invert useOrient computation below):
                var generatingGotRot = (curOrientDOFVal - this._orientDOFValueMaxForward) / this._directionZoneM;
                //now just choose the gotRot that is closest to current
                if (Math.abs(CyclicMath.closestEquivalentRotation(generatingGotRot, 0)) < Math.PI / 2) {
                    gotRot = 0;
                }
                else {
                    gotRot = Math.PI;
                }
            }
        }
        else {
            if (targetPerpConeAngle >= this._zone1Min - epsilon) {
                gotRot = 0;
            }
            else if (targetPerpConeAngle <= -this._zone1Min + epsilon) {
                gotRot = Math.PI;
            }
            else {
                var targetDirectConeAngle = targetPerpConeAngle + Math.PI / 2; //cone with normal at 0,0,1, cone-bits pointing to target
                //var gotRot = rotationFromMinPlaneDirToIntersector(tca, Math.abs(coneDelta - torsoConeAngle));
                gotRot = this._coneMath.rotationFromMinPlaneDirToIntersector(targetDirectConeAngle, Math.abs(this._orientAxisToTiltAxisAngle - this._tiltConeAngle));
            }
        }
        //0 should mean point using the low end of the min plane config
        //if we're ever here, we're an undercut cone situation, so min portion of max-neutral plane will be at orient-max, tilt-min
        useOrient = this._directionZoneM * gotRot + this._orientDOFValueMaxForward;
        useTilt = this._tiltDOFValueMaxForward; //max misalignment with min plane for most neutral plane
    }
    else if (targetPerpConeAngle > this._zone1Min && targetPerpConeAngle < this._zone1Max) {
        dirs = this._coneMath.coneIntersectionAsDualRotations(this._orientAxisToTiltAxisAngle, targetPerpConeAngle, this._tiltConeAngle);
        useTilt = this._tiltDOFValueMinForward - this._directionZoneC1 * dirs[1];
        useOrient = this._orientDOFValueMinForward + this._directionZoneC1 * dirs[0];
    }
    else if (targetPerpConeAngle < -this._zone1Min && targetPerpConeAngle > -this._zone1Max) {
        dirs = this._coneMath.coneIntersectionAsDualRotations(this._orientAxisToTiltAxisAngle, -targetPerpConeAngle, this._tiltConeAngle);
        useTilt = this._tiltDOFValueMinForward + this._directionZoneC2 * dirs[1];
        useOrient = this._orientDOFValueMaxForward - this._directionZoneC2 * dirs[0];
    }
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        //var p = currentPose.getCopy("temp");
        //p.set(this._orientDOFName, useOrient, 0);
        //p.set(this._tiltDOFName, useTilt, 0);
        //this._kinematicGroup.setFromPose(p);
        //this._kinematicGroup.updateWorldCoordinateFrames();
        visHelper.drawConeLocal(this, "HeadRotAxisSweep", this._tiltTransform, null, this._tiltAxisLocal, Math.PI / 2 - this._tiltConeAngle, new THREE.Color(0.7, 1, 0.7));
        visHelper.drawRayLocal(this, "TorsoRot", this._tiltTransform, null, this._tiltAxisLocal, new THREE.Color(0, 0.5, 0), 0.5);
        var swivelOriginLocal = this._swivelTransform.position.clone();
        visHelper.drawConeLocal(this, "HeadRotAxisSweepAtHead", this._tiltTransform, swivelOriginLocal, this._tiltAxisLocal, Math.PI / 2 - this._tiltConeAngle, new THREE.Color(0.7, 1, 0.7));
        visHelper.drawRayLocal(this, "TorsoRotAtHead", this._tiltTransform, swivelOriginLocal, this._tiltAxisLocal, new THREE.Color(0, 0, 0), 0.3);
        visHelper.drawRayLocal(this, "HeadRot", this._swivelTransform, null, this._swivelAxisLocal, new THREE.Color(0, 0, 0.5), 0.5);
        visHelper.drawConeLocal(this, "TargetablePlane", this._swivelTransform, null, this._swivelAxisLocal, 0, new THREE.Color(1, 0.7, 0.7));
        var topWP = this._swivelTransform.getWorldPosition();
        visHelper.drawConeWorld(this, "TargetNormalCone", topWP, this._orientAxisGlobal, Math.PI / 2 - targetPerpConeAngle, new THREE.Color(1, 0.7, 0.7));
    }
    if (Number.isNaN(useOrient) || Number.isNaN(useTilt)) {
        return null;
    }
    else {
        return this.resolveMultiple(currentPose, lastProduced, useOrient, useTilt, rotValue);
    }
};
/**
 *
 * @returns {string}
 */
PlaneAlignmentWithRollLookatDOF.prototype.getName = function () {
    return this._name;
};
/**
 *
 * @returns {string[]}
 */
PlaneAlignmentWithRollLookatDOF.prototype.getControlledDOFNames = function () {
    return [this._orientDOFName, this._tiltDOFName];
};
/**
 *
 * @returns {string[]}
 */
PlaneAlignmentWithRollLookatDOF.prototype.getDOFsNeededInKG = function () {
    return [this._orientDOFName, this._tiltDOFName, this._swivelDOFName];
};
module.exports = PlaneAlignmentWithRollLookatDOF;

},{"../../ifr-geometry/ExtraMath":62,"../base/CyclicMath":70,"./ConeMath":99,"@jibo/three":undefined}],113:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2017 IF Robots LLC
 */
"use strict";
var LookatNode = require("../../ifr-motion/lookat/LookatNode");
var Pose = require("../base/Pose");
var slog = require("../../ifr-core/SLog");
var channel = "LOOKAT";
//TODO: possibly consolidate with LookatNode
//Simplifications made assuming node will not be stabilized; need to implement suggestForwardTarget
// and update pointNodeReport if this changes
/**
 *
 * @param {string} name
 * @param {PlaneAlignmentWithRollLookatDOF} planeAlignmentDOF
 * @param {LookatDOF} rotationalDOF
 * @constructor
 */
var PlaneAlignmentWithRollLookatNode = function (name, planeAlignmentDOF, rotationalDOF) {
    LookatNode.call(this, name, []);
    /**
     * @type {PlaneAlignmentWithRollLookatDOF}
     * @private
     */
    this._planeAlignmentDOF = planeAlignmentDOF;
    /**
     * @type {LookatDOF}
     * @private
     */
    this._rotationalDOF = rotationalDOF;
    /**
     * @type {Array.<string>}
     * @private
     */
    this._planeAlignmentDOFNames = this._planeAlignmentDOF.getControlledDOFNames();
    /**
     * @type {string}
     * @private
     */
    this._rotationalDOFName = this._rotationalDOF.getControlledDOFName();
    /**
     * @type {Array.<string>}
     * @private
     */
    this._dofs = this._planeAlignmentDOFNames.slice();
    if (this._dofs.indexOf(this._rotationalDOFName) === -1) {
        this._dofs.push(this._rotationalDOFName);
    }
    /**
     * @type {Array.<string>}
     * @private
     */
    this._dofsNeededInKG = this._planeAlignmentDOF.getDOFsNeededInKG().slice();
    if (this._dofsNeededInKG.indexOf(this._rotationalDOFName) === -1) {
        this._dofsNeededInKG.push(this._rotationalDOFName);
    }
    //need to redo this from superclass constructor because list of dofs isn't available there
    this._lastPose = new Pose(name + "'s last pose", this.getDOFs());
    /**
     *
     * @type {number}
     * @private
     */
    this._rotationalDOFLastValue = null;
};
PlaneAlignmentWithRollLookatNode.prototype = Object.create(LookatNode.prototype);
PlaneAlignmentWithRollLookatNode.prototype.constructor = PlaneAlignmentWithRollLookatNode;
/**
 *
 * @param {KinematicGroup} kinematicGroup
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.connectToGroup = function (kinematicGroup) {
    LookatNode.prototype.connectToGroup.call(this, kinematicGroup);
    this._planeAlignmentDOF.connectToGroup(kinematicGroup);
    this._rotationalDOF.connectToGroup(kinematicGroup);
};
/**
 *
 * @param {Pose} currentPose
 * @param {Pose} inplaceOutput
 * @param {THREE.Vector3} target
 * @param {Pose} [defaultPose] - use this pose's values in place of values that cannot be currently computed. (currentPose used if ommitted)
 * @param {PointNodeReport} [pointNodeReport] - inplace arg to return metadata about combined computation
 * @param {Pose} [lastProduced] - the pose we last produced (used for consistency if this node must choose from multiple options.  null if this is a new track.  ok to be same as inplaceOutput)
 * @return {boolean} true if all nodes computed a value; false if one or more was uncomputable and had to utilize defaultPose.
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.getPose = function (currentPose, inplaceOutput, target, defaultPose, pointNodeReport, lastProduced) {
    //not modifying pointNodeReport, node is not being stabilized
    // Do not need this here, we will set all values below.
    // And this would override data too early if lastProduced is same instance as inplaceOutput
    //if(inplaceOutput!==currentPose) {
    //	inplaceOutput.setPose(currentPose);
    //}
    if (defaultPose == null) {
        defaultPose = currentPose;
    }
    var anyFailures = false;
    this._kinematicGroup.setFromPose(currentPose);
    //this._kinematicGroup.getRoot().updateMatrixWorld(true);
    this._kinematicGroup.updateWorldCoordinateFrames();
    var pointDOFReport = null;
    var rotValue = this._rotationalDOF.valToPointAtTarget(target, pointDOFReport, currentPose);
    //don't need to recompute for base node, no ancestors will have moved
    //this._kinematicGroup.setFromPose(currentPose);
    ////this._kinematicGroup.getRoot().updateMatrixWorld(true);
    //this._kinematicGroup.updateWorldCoordinateFrames();
    var planeAlignmentVals = this._planeAlignmentDOF.valsToPointAtTarget(target, pointDOFReport, currentPose, rotValue, lastProduced);
    if (planeAlignmentVals != null && rotValue != null) {
        inplaceOutput.set(this._planeAlignmentDOFNames[0], planeAlignmentVals[0], 0);
        inplaceOutput.set(this._planeAlignmentDOFNames[1], planeAlignmentVals[1], 0);
        inplaceOutput.set(this._rotationalDOFName, inplaceOutput.get(this._rotationalDOFName, 0) + rotValue, 0);
        this._rotationalDOFLastValue = rotValue;
    }
    else {
        //give the default value if either computation is invalid; neither is much use without the other.
        slog(channel, "LookatNode " + this._name + " using last value due to uncomputable value for target (" + target.x + ", " + target.y + ", " + target.z + ")");
        inplaceOutput.set(this._planeAlignmentDOFNames[0], defaultPose.get(this._planeAlignmentDOFNames[0], 0), 0);
        inplaceOutput.set(this._planeAlignmentDOFNames[1], defaultPose.get(this._planeAlignmentDOFNames[1], 0), 0);
        inplaceOutput.set(this._rotationalDOFName, defaultPose.get(this._rotationalDOFName, 0), 0);
        anyFailures = true;
    }
    this._lastPose.setPose(inplaceOutput);
    return !anyFailures;
};
/**
 * Get all the dofs that are modified by this node
 * @returns {Array.<string>}
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.getDOFs = function () {
    return this._dofs;
};
/**
 * Get all the dofs that are needed in the provided kinematic group
 * (may include dofs that will not be modified by this node)
 * @return {string[]}
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.getDOFsNeededInKG = function () {
    return this._dofsNeededInKG;
};
/**
 * Find the distance between 2 poses, only accounting for DOFs that are part of this LookatNode.
 * The difference is calculated as a ratio (of error over dof range) rather than absolute value.
 * This function is designed to give a metric lookat progress, e.g., pass in optimal and
 * filtered/current to see how far the lookat still has to go.
 *
 * @param {Pose} pose1
 * @param {Pose} pose2
 * @return {number} greatest ratio (distance/totalDistance) of any of our lookat DOFs between pose1 to pose2
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.distanceAsRatio = function (pose1, pose2) {
    var p1v, p2v, ratio;
    var maxRatio = 0;
    p1v = pose1.get(this._rotationalDOFName, 0);
    p2v = pose2.get(this._rotationalDOFName, 0);
    ratio = this._rotationalDOF.errorRatio(p1v - p2v);
    if (ratio > maxRatio) {
        maxRatio = ratio;
    }
    p1v = pose1.get(this._planeAlignmentDOFNames[0], 0);
    p2v = pose2.get(this._planeAlignmentDOFNames[0], 0);
    ratio = Math.abs((p1v - p2v) / (Math.PI * 2));
    if (ratio > maxRatio) {
        maxRatio = ratio;
    }
    p1v = pose1.get(this._planeAlignmentDOFNames[1], 0);
    p2v = pose2.get(this._planeAlignmentDOFNames[1], 0);
    ratio = Math.abs((p1v - p2v) / (Math.PI * 2));
    if (ratio > maxRatio) {
        maxRatio = ratio;
    }
    return maxRatio;
};
/**
 * The output of a node may have each individual dof pointing differently from its own forward for
 * a collective goal; provide the individual forwards here from the last getPose computation.
 * (useful in some cases to restore configuration to same perceived orientation but with less dofs)
 *
 * Override both this and valsAreIndividuallyForward together.  A DOF will be cleared out if data
 * is unavailable
 *
 * @param {Pose} inplacePose
 */
PlaneAlignmentWithRollLookatNode.prototype.getIndividuallyForwardPose = function (inplacePose) {
    //by default, assume all dofs are individually forward in normal operation
    inplacePose.setPose0Only(this._lastPose);
    //change the forward for the base rotation to be only the contribution of the rotation dof
    inplacePose.set(this._rotationalDOFName, this._rotationalDOFLastValue, 0);
};
/**
 * See getIndividuallyForwardPose.  This function returns true if the individual forwards
 * are the same as what is provided with getPose().  Override both this and getIndividuallyForwardPose
 * together.
 *
 * @returns {boolean} true if the usual values (getPose()) indicate optimal forward indivdually
 */
PlaneAlignmentWithRollLookatNode.prototype.valsAreIndividuallyForward = function () {
    //by default, assume all dofs are individually forward in normal operation
    return false;
};
/**
 *
 * @param {Pose} currentPose - use this current pose
 * @param {THREE.Vector3} inplaceVec
 * @return {THREE.Vector3} a suggestion for a target that is forward for this lookat (node is already looking at this point)
 * @override
 */
PlaneAlignmentWithRollLookatNode.prototype.suggestForwardTarget = function (currentPose, inplaceVec) {
    console.log("Suggest Forward Target not implemented here"); //not planning to use stabilization on this node, may need forward target if we do
    return null;
    //this._kinematicGroup.setFromPose(currentPose);
    ////this._kinematicGroup.getRoot().updateMatrixWorld(true);
    //this._kinematicGroup.updateWorldCoordinateFrames();
    //return this._lookatDOFs[0].suggestForwardTarget(inplaceVec);
};
module.exports = PlaneAlignmentWithRollLookatNode;

},{"../../ifr-core/SLog":57,"../../ifr-motion/lookat/LookatNode":105,"../base/Pose":78}],114:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var PointADOF = require("./PointADOF");
var LookatDOF = require("./LookatDOF");
/**
 *
 * @param {string} name
 * @param {string} controlledDOFName - should be a single translation dof
 * @param {string} centralTransformName - transform to use as anchor for angle computations
 * @param {THREE.Vector3} forwardDirection - forward from centralTransform
 * @param {THREE.Vector3} planeNormal - normal to restrict targets to plane (so motion is along single axis, e.g., left/right, up/down)
 * @param {number} internalDistance - distance behind (along -forward) centralTransform to be calculating angles from
 * @param {number} dofMin - value will be clamped to min, and max-min will be used for error ratio
 * @param {number} dofMax - value will be clamped to max, and max-min will be used for error ratio
 * @extends LookatDOF
 * @constructor
 */
var PlaneDisplacementLookatDOF = function (name, controlledDOFName, centralTransformName, forwardDirection, planeNormal, internalDistance, dofMin, dofMax) {
    LookatDOF.call(this, name, controlledDOFName);
    /** @type {TranslationControl} */
    this._control = null;
    /**	@type {THREE.Vector3} */
    this._forwardDir = forwardDirection;
    /**	@type {string} */
    this._centralTransformName = centralTransformName;
    /**	@type number */
    this._internalDistance = internalDistance;
    /** @type {THREE.Vector3} */
    this._planeNormal = planeNormal;
    /** @type {THREE.Object3D} */
    this._controlledTransform = null;
    /** @type {THREE.Object3D} */
    this._centralTransform = null;
    /** @type {number} */
    this._dofMin = dofMin;
    /** @type {number} */
    this._dofMax = dofMax;
};
PlaneDisplacementLookatDOF.prototype = Object.create(LookatDOF.prototype);
PlaneDisplacementLookatDOF.prototype.constructor = PlaneDisplacementLookatDOF;
/**
 * @param {KinematicGroup} kinematicGroup group to use for kinematic math (assumed to be configured as desired before valToPointAtTarget calls)
 */
PlaneDisplacementLookatDOF.prototype.connectToGroup = function (kinematicGroup) {
    LookatDOF.prototype.connectToGroup.call(this, kinematicGroup);
    if (this._kinematicGroup) {
        this._control = this._kinematicGroup.getModelControlGroup().getControlForDOF(this._controlledDOFName);
        this._controlledTransform = this._kinematicGroup.getTransform(this._control.getTransformName());
        this._centralTransform = this._kinematicGroup.getTransform(this._centralTransformName);
    }
    else {
        this._control = null;
        this._controlledTransform = null;
        this._centralTransform = null;
    }
};
/**
 * Compute value is relative to current setup of the hierarchy that this._transform is part of.
 *
 * @param {THREE.Vector3} target
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @param {Pose} [currentPose] - currentPose of the bot, should be same as pose represented by associated kinematic group
 * @return {number} Value to cause this._control to point local this._forwardDir at the target
 * @override
 */
PlaneDisplacementLookatDOF.prototype.valToPointAtTarget = function (target, pointReport, currentPose) {
    var val = PointADOF.planeIntersectFromRear(this._centralTransform, target, null, this._forwardDir, this._planeNormal, this._internalDistance, pointReport);
    return Math.max(Math.min(val, this._dofMax), this._dofMin);
};
/**
 * Provide the ratio that this error represents for the range of motion of this LookatDOF
 * @param errorAbsolute absolute error
 * @return {number} ratio that absoluteError represents of the total range of this LookatDOF
 * @override
 */
PlaneDisplacementLookatDOF.prototype.errorRatio = function (errorAbsolute) {
    return Math.abs(errorAbsolute / (this._dofMax - this._dofMin));
};
PlaneDisplacementLookatDOF.prototype.suggestForwardTarget = function (inplaceVec) {
    if (this._centralTransform == null) {
        return null;
    }
    else {
        inplaceVec.copy(this._forwardDir);
        inplaceVec.multiplyScalar(10);
        this._centralTransform.localToWorld(inplaceVec);
        return inplaceVec;
    }
};
/**
 *
 * @param {PlaneDisplacementLookatDOF} pdldOne
 * @param {PlaneDisplacementLookatDOF} pdldTwo
 * @param {Pose} pose
 * @param {THREE.Vector3} inplaceOrigin
 * @param {THREE.Vector3} inplaceDirection
 * @return boolean
 */
PlaneDisplacementLookatDOF.getVectorFromOrthogonalPDLDs = function (pdldOne, pdldTwo, pose, inplaceOrigin, inplaceDirection) {
    return PointADOF.vectorFromPlaneIntersections(pdldOne._centralTransform, null, pdldOne._forwardDir, pose.get(pdldOne._controlledDOFName, 0), pdldOne._planeNormal, pdldOne._internalDistance, pose.get(pdldTwo._controlledDOFName, 0), pdldTwo._planeNormal, pdldTwo._internalDistance, inplaceOrigin, inplaceDirection);
};
module.exports = PlaneDisplacementLookatDOF;

},{"./LookatDOF":103,"./PointADOF":115}],115:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var slog = require("../../ifr-core/SLog");
var ExtraMath = require("../../ifr-geometry/ExtraMath");
var channel = "LOOKAT";
var epsilon = 0.001; //TODO: THREE has a high epsilon for converting quaternions to axis angle, ours could decrease if we switched implementation there
var epsilonSquared = epsilon * epsilon;
var visHelper = null;
var PointReport = function () {
    /**
     * value 0 to PI/2 representing angle from target vec to axis (0 means solution arbitrary)
     * @type {?number} */
    this._angleToAxis = null;
    this._distanceToTarget = null;
};
var PointADOF = { name: "PointADOF" };
PointADOF.PointReport = PointReport;
PointADOF.setVisHelper = function (useVisHelper) {
    visHelper = useVisHelper;
};
/**
 * Find unsigned distance between "angle" and closest multiple of PI
 *
 * Find the min angle between a direction vector and a line (i.e., should always be 0 to PI/2)
 * @param angle - angle from a direction vector to a line
 */
var minAngleToLine = function (angle) {
    angle = Math.abs(angle % Math.PI); //now between 0 and PI
    angle = Math.abs(Math.PI / 2 - angle); //now between 0==ortho and PI/2==aligned
    angle = Math.PI / 2 - angle; //now between 0==aligned, PI/2==ortho
    return angle;
};
/**
 * @param {number} original
 * @param {number} min
 * @param {number} max
 * @returns {number} value cyclically equivalent to original.  between min/max if possible, otherwise original is returned.
 */
// eslint-disable-next-line no-unused-vars
var replaceWithInLimitEquivalentIfPossible = function (original, min, max) {
    var diff, numCircles, testOriginal;
    if (original > max) {
        diff = original - max;
        numCircles = Math.ceil(diff / (Math.PI * 2));
        testOriginal = original - (Math.PI * 2) * numCircles;
        if (testOriginal >= min) {
            return testOriginal;
        }
        else {
            return original;
        }
    }
    else if (original < min) {
        diff = min - original;
        numCircles = Math.ceil(diff / (Math.PI * 2));
        testOriginal = original + (Math.PI * 2) * numCircles;
        if (testOriginal <= max) {
            return testOriginal;
        }
        else {
            return original;
        }
    }
    else {
        return original;
    }
};
/**
 *
 * @param {THREE.Vector4} axisAngleV4 - rotational axis in XYZ (normalized), rotation magnitude in radians in W
 * @param {THREE.Vector3} referenceAxisV3 - assumed to be normalized
 * @return {number}
 */
var correctAngleSign = function (axisAngleV4, referenceAxisV3) {
    var calculatedAxis = new THREE.Vector3().copy(axisAngleV4);
    var angleNow = calculatedAxis.angleTo(referenceAxisV3);
    var angleInv = calculatedAxis.multiplyScalar(-1).angleTo(referenceAxisV3);
    if (angleNow <= angleInv) {
        //ok
        if (angleNow > 0.1 && minAngleToLine(axisAngleV4.w) > epsilon) {
            slog(channel, "Error, computed axis (" + calculatedAxis.x + ", " + calculatedAxis.y + ", " + calculatedAxis.z + ") not so close (" + angleNow + ") to references axis (" + referenceAxisV3.x + ", " + referenceAxisV3.y + ", " + referenceAxisV3.z + "), angle = " + axisAngleV4.w);
            return null;
        }
        return axisAngleV4.w;
    }
    else {
        //use inverse
        if (angleInv > 0.1 && minAngleToLine(axisAngleV4.w) > epsilon) {
            slog(channel, "Error, computed axis (" + calculatedAxis.x + ", " + calculatedAxis.y + ", " + calculatedAxis.z + ") not so close (" + angleNow + ") to references axis (" + referenceAxisV3.x + ", " + referenceAxisV3.y + ", " + referenceAxisV3.z + "), angle = " + axisAngleV4.w);
            return null;
        }
        return -axisAngleV4.w;
    }
};
/**
 * Gets the angle between forward and target, with all restricted to the plane provided
 * All are in the local coordinate space of transform (except target).  angleOrigin can be used
 * to change the origin point from which the ray to target is defined if that point is not the origin
 * of transform.
 *
 * @param transform - the transform that all the params in the coordinate system of
 * @param targetPosWorld - world space target
 * @param angleOrigin - local origin to calculate angle from
 * @param angleForward - local forward dir to calculate angel from
 * @param anglePlaneNormal - local plane normal to restrict angle to (also defines sign of result using RHR)
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @returns {?number} angle between angleForward and line from angleOrigin to targetPosWorld, with all projected onto anglePlaneNormal.  anglePlaneNormal defines sign of result using RHR
 */
PointADOF.getRelativeAngle = function (transform, targetPosWorld, angleOrigin, angleForward, anglePlaneNormal, pointReport) {
    if (angleOrigin == null) {
        angleOrigin = new THREE.Vector3(0, 0, 0);
    }
    var localTarget = transform.worldToLocal(new THREE.Vector3().copy(targetPosWorld));
    //wa may want to have params to subtract off local trans/rot
    //take local rotation out of localTarget
    //var localRotation = new THREE.Quaternion().copy(transform.quaternion);
    //localTarget.applyQuaternion(localRotation);
    //take local translation out of localTarget
    //var localTranslation = new THREE.Quaternion().copy(transform.position);
    //localTarget.sub(localTranslation);
    /** @type {THREE.Vector3} */
    var originToLocalTarget = (new THREE.Vector3().copy(localTarget)).sub(angleOrigin);
    if (pointReport) {
        pointReport._angleToAxis = minAngleToLine(originToLocalTarget.angleTo(anglePlaneNormal));
        pointReport._distanceToTarget = originToLocalTarget.length();
    }
    var forwardProjected = new THREE.Vector3().copy(angleForward).projectOnPlane(anglePlaneNormal);
    var originToLocalTargetProjected = new THREE.Vector3().copy(originToLocalTarget).projectOnPlane(anglePlaneNormal);
    if (forwardProjected.lengthSq() < epsilonSquared) {
        slog(channel, "Error getting relative angle, forward too close to plane normal (" + anglePlaneNormal.x + ", " + anglePlaneNormal.y + ", " + anglePlaneNormal.z + ") too close to axis (" + anglePlaneNormal.x + ", " + anglePlaneNormal.y + ", " + anglePlaneNormal.z + ")");
        return null;
    }
    if (originToLocalTargetProjected.lengthSq() < epsilonSquared) {
        slog(channel, "Error getting relative angle, target dir too close to plane normal (" + anglePlaneNormal.x + ", " + anglePlaneNormal.y + ", " + anglePlaneNormal.z + ") too close to axis (" + originToLocalTargetProjected.x + ", " + originToLocalTargetProjected.y + ", " + originToLocalTargetProjected.z + ")");
        return null;
    }
    originToLocalTargetProjected.normalize();
    forwardProjected.normalize();
    //arguments must be normalized
    var rotationNeededQuaternion = new THREE.Quaternion().setFromUnitVectors(forwardProjected, originToLocalTargetProjected);
    var axisAngleV4 = new THREE.Vector4().setAxisAngleFromQuaternion(rotationNeededQuaternion);
    var signedAngle = correctAngleSign(axisAngleV4, anglePlaneNormal);
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        visHelper.drawRayLocal(this, "RelativeAngle:Forward", transform, angleOrigin, angleForward, new THREE.Color(1, 0, 0));
        visHelper.drawLineLocal(this, "RelativeAngle:Target", transform, angleOrigin, new THREE.Vector3().copy(angleOrigin).add(originToLocalTarget), new THREE.Color(0.6, 0.6, 0));
        visHelper.drawLineLocal(this, "RelativeAngle:FlatTarget", transform, angleOrigin, new THREE.Vector3().copy(angleOrigin).add(originToLocalTargetProjected), new THREE.Color(0, 1, 1));
        visHelper.drawRayLocal(this, "RelativeAngle:AxisOfRotation", transform, angleOrigin, anglePlaneNormal, new THREE.Color(0.5, 1, 0));
        visHelper.drawPlaneLocal(this, "RelativeAngle:PlaneOfRotation", transform, angleOrigin, anglePlaneNormal, new THREE.Color(1, 0, 1));
    }
    return signedAngle;
};
/**
 * This function defines an internal point in the coordinate system of transform by displacing
 * along -forward by internalDistanceToCenter.  Then, the intersection of a line between this point
 * and target is computed in the plane defined by angleOrigin and angleForward. All values restricted to
 * the plane defined by anglePlaneNormal.  anglePlaneNormal also defines the sign of the result (+ in RHR direction)
 *
 *
 * @param transform - the transform that all the params in the coordinate system of
 * @param targetPosWorld - world space target
 * @param angleOrigin - local origin to calculate angle from
 * @param angleForward - local forward dir to calculate angel from
 * @param anglePlaneNormal - local plane normal to restrict angle to
 * @param internalDistanceToCenter - distance behind the origin (-forward) to place the eye center
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @returns {?number}
 */
PointADOF.planeIntersectFromRear = function (transform, targetPosWorld, angleOrigin, angleForward, anglePlaneNormal, internalDistanceToCenter, pointReport) {
    if (angleOrigin == null) {
        angleOrigin = new THREE.Vector3(0, 0, 0);
    }
    var internalOrigin = new THREE.Vector3().copy(angleForward).normalize().multiplyScalar(-internalDistanceToCenter).add(angleOrigin);
    var angle = PointADOF.getRelativeAngle(transform, targetPosWorld, internalOrigin, angleForward, anglePlaneNormal, pointReport);
    if (angle != null) {
        var displacement;
        if (angle >= Math.PI / 2) {
            //slog(channel, "Cannot compute exact plane intersect, ray will not intersect plane");
            displacement = Number.POSITIVE_INFINITY;
        }
        else if (angle <= -Math.PI / 2) {
            //slog(channel, "Cannot compute exact plane intersect, ray will not intersect plane");
            displacement = Number.NEGATIVE_INFINITY;
        }
        else {
            displacement = Math.tan(angle) * internalDistanceToCenter;
        }
        if (visHelper !== null && visHelper.shouldDraw(this)) {
            var localTarget = transform.worldToLocal(new THREE.Vector3().copy(targetPosWorld));
            visHelper.drawLineLocal(this, "PlaneIntersectFromRear:InternalToTarget", transform, internalOrigin, localTarget, new THREE.Color(1, 1, 0));
        }
        return displacement;
    }
    else {
        slog(channel, "Plane intersect error, could not get angle");
        return null;
    }
};
/**
 * Computes the world-space ray towards the target given the result of two orthogonal "planeIntersectFromRear" dofs.
 *
 * I.e., you know the point on a 2D plane, computed for a given target via two separate dofs that each
 * rely on planeIntersectFromRear to compute their axis of the plane.  This function will compute the ray
 * to target that resulted in the given point.
 *
 * @param {THREE.Object3D} transform - the transform that all the params in the coordinate system of
 * @param {THREE.Vector3} angleOrigin - local origin to calculate angle from
 * @param {THREE.Vector3} angleForward - local forward dir to calculate angel from
 * @param {number} dofValue1 - the dof value defining one axis of the point on the plane
 * @param {THREE.Vector3} anglePlaneNormal1 - local plane normal to restrict angle to for the first dof (also defines positive direction)
 * @param {number} internalDistanceToCenter1 - distance behind the origin (-forward) to place the eye center for the first dof
 * @param {number} dofValue2 - the dof value defining the second axis of the point on the plane
 * @param {THREE.Vector3} anglePlaneNormal2 - local plane normal to restrict angle to for the second dof (also defines positive direction)
 * @param {number} internalDistanceToCenter2 - distance behind the origin (-forward) to place the eye center for the second dof
 * @param {THREE.Vector3} inplaceOrigin - inplace value to hold resulting origin
 * @param {THREE.Vector3} inplaceDirection - inplace value to hold resulting direction
 * @returns {boolean} true for success
 */
PointADOF.vectorFromPlaneIntersections = function (transform, angleOrigin, angleForward, dofValue1, anglePlaneNormal1, internalDistanceToCenter1, dofValue2, anglePlaneNormal2, internalDistanceToCenter2, inplaceOrigin, inplaceDirection) {
    if (angleOrigin == null) {
        angleOrigin = new THREE.Vector3(0, 0, 0);
    }
    //this order for the cross product will make the positive direction in the same
    // direction as produced by getRelativeAngle/planeIntersectFromRear
    /** @type {THREE.Vector3} */
    var posDir1 = new THREE.Vector3().crossVectors(anglePlaneNormal1, angleForward);
    if (posDir1.lengthSq() < epsilonSquared) {
        slog(channel, "vectorFromPlaneIntersections error, forward (" + ExtraMath.toString(angleForward) + ")and normal1 (" + ExtraMath.toString(anglePlaneNormal1) + ") are not orthogonal");
        return false;
    }
    posDir1.setLength(dofValue1);
    /** @type {THREE.Vector3} */
    var posDir2 = new THREE.Vector3().crossVectors(anglePlaneNormal2, angleForward);
    if (posDir2.lengthSq() < epsilonSquared) {
        slog(channel, "vectorFromPlaneIntersections error, forward (" + ExtraMath.toString(angleForward) + ")and normal2 (" + ExtraMath.toString(anglePlaneNormal2) + ") are not orthogonal");
        return false;
    }
    posDir2.setLength(dofValue2);
    //in local space
    inplaceOrigin.copy(angleOrigin).add(posDir1).add(posDir2);
    //the direction will be a vector that would project as (a) on anglePlaneNormal1 and (b) on anglePlaneNormal2
    //
    // a) (angleOrigin - angleForward*internalDistanceToCenter1) -> (angleOrigin + posDir1)
    //       -angleForward*internalDistanceToCenter1 -> posDir1
    // b) (angleOrigin - angleForward*internalDistanceToCenter2) -> (angleOrigin + posDir2)
    //       -angleForward*internalDistanceToCenter2) -> posDir2
    // we assume that anglePlaneNormal1 and anglePlaneNormal2 are orthogonal
    //in local space
    posDir1.divideScalar(internalDistanceToCenter1);
    posDir2.divideScalar(internalDistanceToCenter2);
    inplaceDirection.copy(angleForward).normalize().add(posDir1).add(posDir2);
    transform.localToWorld(inplaceOrigin);
    ExtraMath.convertDirectionLocalToWorld(transform, inplaceDirection.normalize(), inplaceDirection);
    return true;
};
/**
 *
 * @param {RotationControl} rotationControl
 * @param {THREE.Object3D} transform
 * @param {THREE.Vector3} forward
 * @param {THREE.Vector3} targetPosWorld
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @return {number} closest dof value or null if cannot be computed (singularity)
 */
PointADOF.pointDOF = function (rotationControl, transform, forward, targetPosWorld, pointReport) {
    var localTarget = transform.worldToLocal(new THREE.Vector3().copy(targetPosWorld));
    var localRotation = new THREE.Quaternion().copy(transform.quaternion);
    //take current rotation out of localTarget
    localTarget.applyQuaternion(localRotation);
    //rotate axis by initial so we have local-space axis
    var initialRotation = rotationControl.getInitialRotation(new THREE.Quaternion());
    var axis = rotationControl.getRotationalAxis(new THREE.Vector3());
    axis.applyQuaternion(initialRotation);
    //rotate forward so angles will reflect difference between "forward after initial-rot" and target
    var forwardRotated = new THREE.Vector3().copy(forward).applyQuaternion(initialRotation);
    if (pointReport) {
        pointReport._angleToAxis = minAngleToLine(localTarget.angleTo(axis));
        pointReport._distanceToTarget = localTarget.length();
    }
    //remove non-axial components of directions
    var forwardProjected = new THREE.Vector3().copy(forwardRotated).projectOnPlane(axis);
    var localProjected = new THREE.Vector3().copy(localTarget).projectOnPlane(axis);
    //check for degenerate cases
    if (forwardProjected.lengthSq() < epsilonSquared || localProjected.lengthSq() < epsilonSquared) {
        slog(channel, "Error pointing DOF, Forward length:" + forwardProjected.length() + " local length:" + localProjected.length());
        return null;
    }
    forwardProjected.normalize();
    localProjected.normalize();
    //find out how much rotation this quaternion represents around our given axis
    var rotationNeededQuaternion = new THREE.Quaternion().setFromUnitVectors(forwardProjected, localProjected);
    var axisAngleV4 = new THREE.Vector4().setAxisAngleFromQuaternion(rotationNeededQuaternion);
    var dofValue = correctAngleSign(axisAngleV4, axis);
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        visHelper.drawRayLocal(this, "PointAt:CurForwardDir", transform, null, forward, new THREE.Color(1, 0, 0));
        var axisRaw = rotationControl.getRotationalAxis(new THREE.Vector3());
        //ok to draw axis using current transform internal rotation since it is initial + axis-angle, and axis-angle portion won't affect axis
        visHelper.drawRayLocal(this, "PointAt:AxisOfRotation", transform, null, axisRaw, new THREE.Color(1, 1, 0));
        visHelper.drawPlaneLocal(this, "PointAt:PlaneOfRotation", transform, null, axisRaw, new THREE.Color(1, 0, 1));
        var forwardInitial = new THREE.Vector3().copy(forward);
        forwardInitial.applyQuaternion(initialRotation);
        forwardInitial.applyQuaternion(new THREE.Quaternion().copy(localRotation).inverse()); //undo the current frame influence when going local to world
        visHelper.drawRayLocal(this, "PointAt:InitForwardDir", transform, null, forwardInitial, new THREE.Color(0, 1, 1));
        var dofValueRotation = new THREE.Quaternion().setFromAxisAngle(axis, dofValue);
        var dofDir = new THREE.Vector3().copy(forwardRotated).applyQuaternion(dofValueRotation);
        dofDir.applyQuaternion(new THREE.Quaternion().copy(localRotation).inverse()); //undo the current frame influence when going local to world
        visHelper.drawRayLocal(this, "PointAt:FlatTargetVec", transform, null, dofDir, new THREE.Color(0, 1, 1));
    }
    return dofValue;
};
/**
 *
 * The first of the generated answers will be the one where the normal is on the side of "axis cross target";
 * that is, the lowest part of the plane will point down on that side.  Robot will "lean left" wrt the target
 * if the dof in question is vertical.
 *
 * @param {RotationControl} rotationControl
 * @param {THREE.Object3D} transform
 * @param {THREE.Vector3} planeNormal - would be plane normal if angleAbovePlaneForIntersection == 0, otherwise axis of cone
 * @param {number} distanceAlongDOFAxisToPlane - cone/plane is mounted this far along dof axis
 * @param {THREE.Vector3} targetPosWorld
 * @param {number} angleAbovePlaneForIntersection - angle of cone; 0 means a flat plane, positive values "raise" plane where up is the axis of control.
 * @param {boolean} approximateVerticalToLinear - if true, instead of "true" angle, imagine that linear axis rotation created linear vertical angle change
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @return {number[]} 1 or 2 points that cause cone to touch target or come as close as possible.
 */
PointADOF.pointDOFToIntersectConeWithPoint = function (rotationControl, transform, planeNormal, distanceAlongDOFAxisToPlane, targetPosWorld, angleAbovePlaneForIntersection, approximateVerticalToLinear, pointReport) {
    var localTarget = transform.worldToLocal(new THREE.Vector3().copy(targetPosWorld));
    var localRotation = new THREE.Quaternion().copy(transform.quaternion);
    //take current rotation out of localTarget
    localTarget.applyQuaternion(localRotation);
    //rotate axis by initial so it's in true local space
    var initialRotation = rotationControl.getInitialRotation(new THREE.Quaternion());
    var axis = rotationControl.getRotationalAxis(new THREE.Vector3());
    var rotatedAxis = new THREE.Vector3().copy(axis).applyQuaternion(initialRotation);
    if (planeNormal.angleTo(axis) > Math.PI / 2.0) {
        //same plane, but makes trig assumptions simpler
        planeNormal = new THREE.Vector3().copy(planeNormal).multiplyScalar(-1);
    }
    //move localTarget to account for distanceAlongDOFAxisToPlane
    if (distanceAlongDOFAxisToPlane !== 0) {
        var transVec = new THREE.Vector3().copy(rotatedAxis);
        transVec.multiplyScalar(distanceAlongDOFAxisToPlane / transVec.length());
        localTarget.sub(transVec);
    }
    //move localTarget to account for cone angle above plane
    if (angleAbovePlaneForIntersection !== 0) {
        var bendForPlaneModAxis = new THREE.Vector3().crossVectors(rotatedAxis, localTarget).normalize();
        //applyAxisAngle REQUIRES normalize angle!!
        localTarget.applyAxisAngle(bendForPlaneModAxis, angleAbovePlaneForIntersection);
    }
    if (visHelper !== null && visHelper.shouldDraw(this)) {
        //these will draw on "current" rotation of transform, before
        var normalStart = new THREE.Vector3().copy(axis).setLength(distanceAlongDOFAxisToPlane);
        visHelper.drawRayLocal(this, "Plane:Normal", transform, normalStart, planeNormal, new THREE.Color(1, 1, 1));
        var planeStart = new THREE.Vector3().copy(axis).setLength(distanceAlongDOFAxisToPlane);
        visHelper.drawConeLocal(this, "Plane:Surface", transform, planeStart, planeNormal, angleAbovePlaneForIntersection, new THREE.Color(1, 0, 1));
    }
    //we want the normal after the initial rot, ready to be rotated around axis
    var normalPostInitialRot = new THREE.Vector3().copy(planeNormal).applyQuaternion(initialRotation);
    //angle between axis and normal, after initial rotation on both
    var axisToNormalAngle = rotatedAxis.angleTo(normalPostInitialRot);
    if (axisToNormalAngle < epsilon) {
        //planeNormal has already been replaced with opposite vector to be close to axis if necessary (above)
        //thus, angle should be between 0 and PI/2, don't need to also check against angles near PI for degeneracy
        slog(channel, "Error, plane normal (" + planeNormal.x + ", " + planeNormal.y + ", " + planeNormal.z + ") too close to axis (" + axis.x + ", " + axis.y + ", " + axis.z + ")");
        return null;
    }
    //here we look at the joint from the "side", that is, on a plane defined by the rotational axis and the target
    //we then decide, form this side view, what would the angle of the normal be (wrt axis) that would achieve the target
    //once we know that, we can compute the rotation of the axis that would achieve that normal angle in this projection
    //this is done in 2 parts.
    //   first the angle computed is how far axis must rotate for normal to achieve target from the "back" position
    //      "back" is the position where normal lines up with axis from this projection
    //what the normal would be, if the plane did intersect the target, projected onto the plane defined by axis and localTarget
    //PI/2 - (angle from axis to target) because "(angle from axis to target)" would be the plan itself, and we want the normal
    //positive angles lean off the left of axis on the plane; since we're rotating around axis from the "back", we'll want positive
    //rotations to get us over there
    var normalAngleProjected = Math.PI / 2.0 - rotatedAxis.angleTo(localTarget);
    //the top side of a triangle on above plane defined by axis (length 1) and a hypotenuse starting at axis origin and with angle normalAngleProjected
    var dTopProjected = Math.tan(normalAngleProjected);
    //same style triangle, but with angle for actual normal
    var dTopNormal = Math.tan(axisToNormalAngle);
    //how far we need to rotate the normal from it's start so its projection would line up with normalAngleProjected
    //think unit circle: we are rotating a line of length dTopNormal until its projection on y = dTopProjected
    //(or in this case rotating dTopProjected around axis until its projection on the plane is dTopNormal, starting with it pointing directly away from plane (projection = 0 at theta=0))
    //max/min here clamps the ratio to -1 to 1, effectively making the target we shoot for be in the range achievable by the normal's angle off axis
    var rBackPosToProjected = null;
    if (approximateVerticalToLinear) {
        //TODO: these two should be 2 selectable modes:
        //extra smooth at max/min, using reverse sin
        //rBackPosToProjected = Math.PI/2 * Math.sin(Math.PI/2 * (Math.max(-1, Math.min(1, dTopProjected / dTopNormal))));
        //linear to avoid extra motion at max/min to achieve last bit of angle
        rBackPosToProjected = (Math.PI / 2.0) * (Math.max(-1, Math.min(1, dTopProjected / dTopNormal)));
    }
    else {
        rBackPosToProjected = Math.asin(Math.max(-1, Math.min(1, dTopProjected / dTopNormal)));
    }
    if (pointReport) {
        pointReport._angleToAxis = minAngleToLine(localTarget.angleTo(rotatedAxis));
        pointReport._distanceToTarget = localTarget.length();
    }
    if (minAngleToLine(localTarget.angleTo(rotatedAxis)) < epsilon) {
        slog(channel, "Error, Lookat Target local:(" + localTarget.x + ", " + localTarget.y + ", " + localTarget.z + "), world:(" + targetPosWorld.x + ", " + targetPosWorld.y + ", " + targetPosWorld.z + ") too close to rotated axis (" + rotatedAxis.x + ", " + rotatedAxis.y + ", " + rotatedAxis.z + ")");
        return null;
    }
    //now we need to know how far we need to rotate actual normal vector to reach "back" position
    var backVec = new THREE.Vector3().crossVectors(rotatedAxis, localTarget).normalize();
    var flatNormal = new THREE.Vector3().copy(normalPostInitialRot).projectOnPlane(rotatedAxis).normalize();
    var normToBack = new THREE.Quaternion().setFromUnitVectors(flatNormal, backVec);
    var normToBackAxisAngleV4 = new THREE.Vector4().setAxisAngleFromQuaternion(normToBack);
    var rNormalToBackPos = correctAngleSign(normToBackAxisAngleV4, rotatedAxis);
    var otherRBackPosToProjected = -(rBackPosToProjected - (-Math.PI / 2.0)) + -Math.PI / 2.0;
    var total1 = rNormalToBackPos + rBackPosToProjected;
    var total2 = rNormalToBackPos + otherRBackPosToProjected;
    //return [replaceWithInLimitEquivalentIfPossible(total1, rotationControl.getMin(), rotationControl.getMax()),
    //	replaceWithInLimitEquivalentIfPossible(total2, rotationControl.getMin(), rotationControl.getMax())];
    return [total1, total2];
};
module.exports = PointADOF;

},{"../../ifr-core/SLog":57,"../../ifr-geometry/ExtraMath":62,"@jibo/three":undefined}],116:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var AccelPlanner = require("../base/AccelPlanner");
var Pose = require("../base/Pose");
var channel = "LOOKAT";
/**
 *
 * @param {string[]} dofNames
 * @constructor
 */
var PoseOffsetFilter = function (dofNames) {
    /**
     * @type {string[]}
     * @protected
     */
    this._dofNames = dofNames;
    /**
     * @type {Pose}
     * @protected
     */
    this._targetPose = new Pose("POF Target", dofNames);
    /**
     * @type {Pose}
     * @protected
     */
    this._filteredPose = new Pose("POF Filtered", dofNames);
    /**
     * @type {AccelPlanner}
     * @protected
     */
    this._accelPlanner = new AccelPlanner();
    /**
     * @type {number}
     * @protected
     */
    this._accLimit = 0.5;
    /**
     * @type {number}
     * @protected
     */
    this._rejectionVelocityThreshold = 0;
    /**
     * @type {number}
     * @protected
     */
    this._epsilon = 0.00001;
    /**
     * @type {Array.<number>}
     * @protected
     */
    this._dofIndices = this._targetPose.getDOFIndices();
};
/**
 * Compute the time needed to make the trip to targetPose
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {AccelPlanner} accelPlanner
 * @param {number} accLimit
 * @param {Array.<number>} dofIndices
 * @return {number}
 * @protected
 */
PoseOffsetFilter.prototype._timeForLongestDOF = function (targetPose, filteredPose, accelPlanner, accLimit, dofIndices) {
    /** @type {number} */
    var currentPos, currentVel;
    /** @type {number} */
    var target;
    /** @type {AccelPlan} */
    var myPlan;
    /** @type {number} */
    var index;
    var transitionTime = 0;
    for (var i = 0; i < dofIndices.length; i++) {
        index = dofIndices[i];
        currentPos = filteredPose.getByIndex(index, 0);
        currentVel = filteredPose.getByIndex(index, 1);
        target = targetPose.getByIndex(index, 0);
        myPlan = accelPlanner.computeWithFixedAccel(currentVel, 0, target - currentPos, accLimit);
        var thisDOFTime;
        if (myPlan && myPlan.isConsistent()) {
            thisDOFTime = myPlan.getTotalTime();
        }
        else {
            slog(channel, "PoseOffsetFilter(tt) for " + filteredPose.getDOFNameForIndex(index) + " got invalid plan, using backup time of 10! (currentVel:" + currentVel + ", target:" + target + ", currentPos:" + currentPos + ", acceLimit:" + accLimit + ")");
            thisDOFTime = 10; //should never happen, but still need to act...  choose large time.
        }
        if (thisDOFTime > transitionTime) {
            transitionTime = thisDOFTime;
        }
    }
    return transitionTime;
};
/**
 *
 * @param {number} advanceSeconds - advance by this many seconds
 * @param {number} totalTransitTime - target this time as the total transit time
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {AccelPlanner} accelPlanner
 * @param {Array.<number>} dofIndices
 *
 * @protected
 */
PoseOffsetFilter.prototype._advanceFixedTimeMode = function (advanceSeconds, totalTransitTime, targetPose, filteredPose, accelPlanner, dofIndices) {
    /** @type {number} */
    var currentPos, currentVel;
    /** @type {number} */
    var target;
    /** @type {AccelPlan} */
    var myPlan;
    /** @type {number} */
    var index;
    if (totalTransitTime > this._epsilon) {
        for (var i = 0; i < dofIndices.length; i++) {
            index = dofIndices[i];
            currentPos = filteredPose.getByIndex(index, 0);
            currentVel = filteredPose.getByIndex(index, 1);
            target = targetPose.getByIndex(index, 0);
            myPlan = accelPlanner.computeWithFixedTime(currentVel, 0, target - currentPos, totalTransitTime);
            if (myPlan && myPlan.isConsistent()) {
                var displacement = myPlan.displacementAtTime(advanceSeconds);
                var newVelocity = myPlan.velocityAtTime(advanceSeconds);
                filteredPose.setByIndex(index, [currentPos + displacement, newVelocity]);
            }
            else {
                slog(channel, "PoseOffsetFilter(dp) for " + filteredPose.getDOFNameForIndex(index) + " got invalid plan, using backup filter! (currentVel:" + currentVel + ", target:" + target + ", currentPos:" + currentPos + ", totalTransitTime:" + totalTransitTime + ")");
                //should never happen, but still need to act...  filter towards target, deccelerate a bit.
                filteredPose.setByIndex(index, [currentPos * 0.99 + target * 0.01, currentVel * 0.96]);
            }
        }
    } // else if time is less than epsilon, simply don't change anything
};
/**
 * @param {number} seconds
 */
PoseOffsetFilter.prototype.updateByTime = function (seconds) {
    var transitionTime = this._timeForLongestDOF(this._targetPose, this._filteredPose, this._accelPlanner, this._accLimit, this._dofIndices);
    this._advanceFixedTimeMode(seconds, transitionTime, this._targetPose, this._filteredPose, this._accelPlanner, this._dofIndices);
};
PoseOffsetFilter.prototype.resetToTarget = function () {
    this._filteredPose.setPose(this._targetPose);
};
/**
 * @param {Pose} newCurrentPose
 */
PoseOffsetFilter.prototype.resetToPose = function (newCurrentPose) {
    this._filteredPose.setPose(newCurrentPose);
    this._targetPose.setPose(newCurrentPose);
};
/**
 * @param {Pose} newTargetPose
 */
PoseOffsetFilter.prototype.setTarget = function (newTargetPose) {
    this._targetPose.setPose(newTargetPose);
};
/**
 * @param {Pose} inplacePose
 */
PoseOffsetFilter.prototype.getTarget = function (inplacePose) {
    inplacePose.setPose(this._targetPose);
};
/**
 * Get the current value of the filtered pose.
 * Only positions are set in inplacePose.
 *
 * @param {Pose} inplacePose
 * @param {boolean} [includePreOffsetVelocities] - true to include the current pre-offset velocities.  false or omitted to get only position.
 */
PoseOffsetFilter.prototype.getValue = function (inplacePose, includePreOffsetVelocities) {
    if (includePreOffsetVelocities) {
        inplacePose.setPose(this._filteredPose);
    }
    else {
        //inplacePose.setPose(filteredPose);
        inplacePose.setPose0Only(this._filteredPose);
    }
};
/**
 * Get the velocities of this filter, not accounting for the
 * motion due to incoming offsets (e.g., the offsets move the positions,
 * but do not affect these separately maintained velocities)
 *
 * @param {Pose} inplacePose - replace velocities in inplacePose with our pre-offset velocities
 */
PoseOffsetFilter.prototype.getPreOffsetVelocities = function (inplacePose) {
    var dofIndices = this._dofIndices;
    var filteredPose = this._filteredPose;
    var index;
    for (var i = 0; i < dofIndices.length; i++) {
        index = dofIndices[i];
        inplacePose.setByIndex(index, filteredPose.getByIndex(index, 1), 1);
    }
};
/**
 * Set the threshold for rejecting velocities passed into applyUnfilteredOffset.
 * Velocities larger than this threshold will be clamped.
 *
 * @param {number} rejectVelocitiesGreaterThan
 */
PoseOffsetFilter.prototype.setRejectVelocityThreshold = function (rejectVelocitiesGreaterThan) {
    this._rejectionVelocityThreshold = rejectVelocitiesGreaterThan;
};
/**
 * Get the threshold for rejecting velocities passed into applyUnfilteredOffset.
 * Velocities larger than this threshold will be clamped.
 *
 * @return {number}
 */
PoseOffsetFilter.prototype.getRejectVelocityThreshold = function () {
    return this._rejectionVelocityThreshold;
};
PoseOffsetFilter.prototype.setAcceleration = function (accel) {
    this._accLimit = accel;
};
/**
 * Apply deltaPose as a direct addition to existing filtered pose (position only).
 * Pose is applied directly without passing through any filtering. (except max velocity)
 *
 * @param {Pose} deltaPose
 * @param {number} deltaTime - used for applying rejection velocity
 */
PoseOffsetFilter.prototype.applyUnfilteredOffset = function (deltaPose, deltaTime) {
    var dofIndices = this._dofIndices;
    var applyDeltaThreshold = this._rejectionVelocityThreshold !== 0;
    var rejectionDeltaThreshold = this._rejectionVelocityThreshold * deltaTime;
    var filteredPose = this._filteredPose;
    var index;
    for (var i = 0; i < dofIndices.length; i++) {
        index = dofIndices[i];
        var dVal = deltaPose.getByIndex(index, 0);
        if (applyDeltaThreshold && Math.abs(dVal) > rejectionDeltaThreshold) {
            slog.error("PoseOffsetFilter:Clamping application of unfiltered offset of " + dVal + " to " + filteredPose.getDOFNameForIndex(index) + " as it is greater than " + rejectionDeltaThreshold);
            if (dVal < 0) {
                dVal = -rejectionDeltaThreshold;
            }
            else {
                dVal = rejectionDeltaThreshold;
            }
        }
        var fVal = filteredPose.getByIndex(index, 0);
        if (fVal !== null) {
            fVal += dVal;
        }
        filteredPose.setByIndex(index, fVal, 0);
    }
};
module.exports = PoseOffsetFilter;

},{"../../ifr-core/SLog":57,"../base/AccelPlanner":67,"../base/Pose":78}],117:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var Pose = require("../base/Pose");
var PoseOffsetFilter = require("./PoseOffsetFilter");
var channel = "LOOKAT";
/**
 * Enum Values for windup state.
 *
 * Windup state broken into 4 parts
 *  - Accel from initial position away from target (gaining "away" velocity and position) (WINDING_ACCEL)
 *  - Accel towards target, zeroing out our "away" velocity, still gaining "away" position (WINDING_DECEL)
 *  - Accel towards target, gaining "towards" velocity and reducing our "away" position (WINDING_RESTORING)
 *  - Once our "away" position is zero'd, we're back at initial position, clear of windup and in the NONE state
 *
 *  If accel used during initial windup (WINDING_ACCEL period) were equal to accel used afterwards heading to target,
 *  these would all be exact.  However the eventual accel may be different, as it is constantly re-planned
 *  and can change (especially if target changes).  Thus these stages are only approximate, but should be usable
 *  for rough scheduling.
 *
 * @enum {number}
 */
var WindupState = {
    /**
     * We are in a windup-free trajectory, or a trajectory with windup after the effects have been
     * applied (e.g., we have already wound up and come back to the right side of the initial position)
     */
    NONE: 4,
    /**
     * We are accelerating away from the target (Windup up)
     */
    WINDING_ACCEL: 1,
    /**
     * We are accelerating toward the target, but have not yet cancelled the velocity
     * added by our acceleration away from the target (moving away from target and initial position)
     */
    WINDING_DECEL: 2,
    /**
     * We are accelerating towards the target and moving towards the target
     * (after having cancelled our velocity added during windup), but have not yet
     * cancelled the positional error accrued (have not yet gotten back to initial position after
     * our windup period)
     */
    WINDING_RESTORING: 3
};
/**
 *
 * @param {string[]} dofNames
 * @constructor
 * @extends PoseOffsetFilter
 */
var PoseOffsetFilterWindup = function (dofNames) {
    PoseOffsetFilter.call(this, dofNames);
    /**
     * @type {boolean}
     */
    this._shouldStartWindup = false;
    /**
     * @type {number}
     */
    this._windupTimeRemaining = 0;
    /**
     * Used for reporting windup state; calculated to be the time from windup start until we're back to zero velocity
     * This will be 2x initial _windupTimeRemaining, as once we start towards target, it will take approximately the same time
     * to get back to zero V as we spent accelerating away (approximate because the accel may be slightly different
     * when we make our new plan, but it should be very close)
     *
     * @type {number}
     * @private
     */
    this._windupTimeToZeroVRemaining = 0;
    /**
     * Used for reporting windup state; calculated to be the time from windup start until we're back to the initial
     * starting position.  This will be sqrt(2) * "initial _windupTimeRemaining" + _windupTimeToZeroVRemaining:
     * k = initial _windupTimeRemaining
     * Distance_During_k = a * (k^2) / 2
     * TotalBackwardsDistance = a * (k^2)
     * Solve for return time r:  a * (k^2) = a * (r^2) / 2
     * r = sqrt(2)*k //and add _windupTimeToZeroVRemaining since we want "out time" + "return time"
     *
     * @type {number}
     * @private
     */
    this._windupTimeToZeroPRemaining = 0;
    /**
     * This pose will actually hold the accelerations to be used in the current windup (in the 0th slot)
     * Windup will consist of accelerating at these accelerations for windupTimeRemaining
     * @type {Pose}
     * @private
     */
    this._windupAccel = new Pose("windup accel", dofNames);
    /**
     * This pose will actually hold the distances to be used in the current target overshoot (in the 0th slot)
     * Every tick, these values will be added to the actual target until we invalidate the windup by
     * passing the real target.
     * @type {Pose}
     * @private
     */
    this._targetOvershootDelta = new Pose("target overshoot delta", dofNames);
    /**
     * Temp pose to hold target+overshoot
     * @type {Pose}
     * @private
     */
    this._overshootModifiedTarget = new Pose("target for overshoot", dofNames);
    /**
     * @type {boolean}
     * @private
     */
    this._weAreOvershooting = false;
    //config params: see WindupOvershootParams typedef for descriptions
    /**
     * @type {number}
     * @private
     */
    this._maxAllowedTriggerSpeed = 0.005;
    this._minAllowedTriggerDistance = 0.01;
    this._maxAllowedTriggerDistance = Infinity;
    /**
     * @type {number}
     * @private
     */
    this._windupDistanceRatio = 0.05;
    this._windupMaxDistance = 0.002;
    this._windupMinDistance = 0.001;
    /**
     * @type {number}
     * @private
     */
    this._overshootDistanceRatio = 0.05;
    this._overshootMaxDistance = 0.002;
    this._overshootMinDistance = 0.001;
};
PoseOffsetFilterWindup.prototype = Object.create(PoseOffsetFilter.prototype);
PoseOffsetFilterWindup.prototype.constructor = PoseOffsetFilterWindup;
PoseOffsetFilterWindup.WindupState = WindupState;
/**
 * Params to setup windup/overshoot.
 * @typedef {Object} WindupOvershootParams
 *
 * @property {?number} maxAllowedTriggerSpeed - maximum speed (for any particular dof) allowable for starting a new windup/overshoot trajectory
 * @property {?number} minAllowedTriggerDistance - minimum current-to-target distance allowable for starting a new windup/overshoot trajectory
 * @property {?number} maxAllowedTriggerDistance - maximum current-to-target distance allowable for starting a new windup/overshoot trajectory
 *
 * @property {?number} windupDistanceRatio - fraction of current-to-target distance which defines the windup distance
 * @property {?number} windupMinDistance - clamp windup distance to this minimum (windups will be no smaller)
 * @property {?number} windupMaxDistance - clamp windup distance to this maximum (windups will be no larger)
 *
 * @property {?number} overshootDistanceRatio - fraction of current-to-target distance which defines the overshoot distance
 * @property {?number} overshootMinDistance - clamp overshoot distance to this minimum (overshoots will be no smaller)
 * @property {?number} overshootMaxDistance - clamp overshoot distance to this maximum (overshoot will be no larger)
 * @intdocs
 */
/**
 * @param {WindupOvershootParams} params
 */
PoseOffsetFilterWindup.prototype.configure = function (params) {
    if (this._windupTimeRemaining > 0 || this._weAreOvershooting) {
        slog(channel, "PoseOffsetFilterWindup: cancelling running windup/overshoot because we are being reconfigured during execution");
        this._windupTimeRemaining = 0;
        this._windupTimeToZeroPRemaining = 0;
        this._windupTimeToZeroVRemaining = 0;
        this._weAreOvershooting = false;
    }
    if (params.maxAllowedTriggerSpeed != null) {
        this._maxAllowedTriggerSpeed = params.maxAllowedTriggerSpeed;
    }
    if (params.minAllowedTriggerDistance != null) {
        this._minAllowedTriggerDistance = params.minAllowedTriggerDistance;
    }
    if (params.maxAllowedTriggerDistance != null) {
        this._maxAllowedTriggerDistance = params.maxAllowedTriggerDistance;
    }
    if (params.windupDistanceRatio != null) {
        this._windupDistanceRatio = params.windupDistanceRatio;
    }
    if (params.windupMinDistance != null) {
        this._windupMinDistance = params.windupMinDistance;
    }
    if (params.windupMaxDistance != null) {
        this._windupMaxDistance = params.windupMaxDistance;
    }
    if (params.overshootDistanceRatio != null) {
        this._overshootDistanceRatio = params.overshootDistanceRatio;
    }
    if (params.overshootMinDistance != null) {
        this._overshootMinDistance = params.overshootMinDistance;
    }
    if (params.overshootMaxDistance != null) {
        this._overshootMaxDistance = params.overshootMaxDistance;
    }
};
/**
 * Indicate that a windup trajectory should be started right now if possible.
 * It will either be started next update or not at all; it will only start if the status criteria
 * are met. (see checkTrajectoryStartCriteria)
 */
PoseOffsetFilterWindup.prototype.startWindupIfPossible = function () {
    if (this._windupDistanceRatio !== 0 || this._overshootDistanceRatio !== 0) {
        //enable only if we have any windup/overshoot configured
        this._shouldStartWindup = true;
    }
};
/**
 * Check to see if it is a valid time to start a windup/overshoot trajectory, based on distance
 * to target and current speed.
 *
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {number[]} dofIndices
 * @param {number} maxAllowedTriggerSpeed
 * @param {number} minAllowedTriggerDistance
 * @param {number} maxAllowedTriggerDistance
 * @return {boolean} - true if it is an acceptible time to start a new trajectory
 */
var checkTrajectoryStartCriteria = function (targetPose, filteredPose, dofIndices, maxAllowedTriggerSpeed, minAllowedTriggerDistance, maxAllowedTriggerDistance) {
    var maxDOFVelocity = 0;
    var maxDOFDistance = 0;
    //get current velocity and distance to target
    for (var i = 0; i < dofIndices.length; i++) {
        var index = dofIndices[i];
        var currentVelAbs = Math.abs(filteredPose.getByIndex(index, 1));
        var dofDistance = Math.abs(filteredPose.getByIndex(index, 0) - targetPose.getByIndex(index, 0));
        if (currentVelAbs > maxDOFVelocity) {
            maxDOFVelocity = currentVelAbs;
        }
        if (dofDistance > maxDOFDistance) {
            maxDOFDistance = dofDistance;
        }
    }
    return (maxDOFVelocity <= maxAllowedTriggerSpeed &&
        maxDOFDistance >= minAllowedTriggerDistance && maxDOFDistance <= maxAllowedTriggerDistance);
};
/**
 * Given the windupAccelerations, compute how long we should accelerate to achieve a windup of the correct
 * distance
 *
 * @param {Pose} windupAccelerations - the accelerations to use during the windup
 * @param {number} totalDistance - the total distance to target (used to compute windup amount)
 * @param {number} windupDistanceRatio - this fraction of total distance is how much ground our windup should cover
 * @param {number} windupMinDistance - clamp any windup to this minimum
 * @param {number} windupMaxDistance - clamp any windup to this maximum
 * @param {number[]} dofIndices - dof indices for easier iterating
 * @returns {number} time to accelerate away from target to achieve windup
 */
var computeWindupTime = function (windupAccelerations, totalDistance, windupDistanceRatio, windupMinDistance, windupMaxDistance, dofIndices) {
    /** @type {number} */
    var index;
    /** @type {number} */
    var i;
    var totalAccel = 0;
    for (i = 0; i < dofIndices.length; i++) {
        index = dofIndices[i];
        var thisDOFAccel = windupAccelerations.getByIndex(index, 0);
        totalAccel += Math.pow(thisDOFAccel, 2);
    }
    totalAccel = Math.sqrt(totalAccel);
    var desiredDistance = totalDistance * windupDistanceRatio;
    desiredDistance = Math.max(windupMinDistance, Math.min(windupMaxDistance, desiredDistance));
    //compute how long we need to travel at totalAccel to move 1/2 desiredDistance (1/2 to account for deccel period)
    //desiredDistance/2 = (initialVelocity * time + (acceleration * time^2) / 2);
    //let's use initialVelocity of zero
    //2 * desiredDistance / 2 / acceleration = time^2
    var windupTime = Math.sqrt(desiredDistance / totalAccel);
    return windupTime;
};
/**
 * Compute the distance to target (treating the dofs as orthogonal axes).  Also compute
 * the distance for each dof seperately, and store in inplaceDOFDistances
 *
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {Pose} inplacePerDOFDistances - store the per-dof differences here
 * @param {number[]} dofIndices
 * @param {number} epsilon
 * @return {number} the distance (straight line assuming nd space)
 */
var computeTotalDistanceToTarget = function (targetPose, filteredPose, inplacePerDOFDistances, dofIndices, epsilon) {
    /** @type {number} */
    var totalDistance = 0;
    for (var i = 0; i < dofIndices.length; i++) {
        var index = dofIndices[i];
        var currentPos = filteredPose.getByIndex(index, 0);
        var target = targetPose.getByIndex(index, 0);
        var delta = target - currentPos;
        if (Math.abs(delta) < epsilon) {
            delta = 0;
        }
        //compute overshoot delta
        //these will be later scaled to account for desired distance
        inplacePerDOFDistances.setByIndex(index, delta, 0);
        if (delta !== 0) {
            totalDistance += Math.pow(delta, 2);
        }
    }
    return Math.sqrt(totalDistance);
};
/**
 * Computed the accelerations to be used by each dof during windup, proportioned to go in the correct 2d direction.
 *
 * @param {number} totalTransitTime - time for the total transition if it was performed normally (used to find our accelerations)
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {AccelPlanner} accelPlanner
 * @param {Pose} inplaceWindupAccelerations - store the per-dof accelerations used by the normal trajectory here to use for windup
 * @param {number[]} dofIndices
 * @param {number} epsilon
 */
var computeWindupAccelerations = function (totalTransitTime, targetPose, filteredPose, accelPlanner, inplaceWindupAccelerations, dofIndices, epsilon) {
    /** @type {number} */
    var index;
    /** @type {number} */
    var i;
    //compute accel for all dofs, we'll lock this in for the whole windup period
    //
    //we'll use the acceleration each dof would have if we were to perform a normal transition to the target
    //the intention is
    //	a) use similar accel they will use once they regular transition kicks in
    //		(this is not exact, since they will start from a new situation after the windup, but close)
    //	b) use accelerations proportional to their motions
    // 		This is to get 2d direction of motion is inline with the eventual path (instead of always 45°!)
    //	c) vales are signed, so each dof winds up in the correct direction
    for (i = 0; i < dofIndices.length; i++) {
        index = dofIndices[i];
        //in this loop, we will set up the windup accelerations
        //they will be zero for all dofs if our total plan time is insufficient
        // (we should not be called in this case however)
        if (totalTransitTime > epsilon) {
            var currentPos = filteredPose.getByIndex(index, 0);
            var currentVel = filteredPose.getByIndex(index, 1);
            var target = targetPose.getByIndex(index, 0);
            var myPlan = accelPlanner.computeWithFixedTime(currentVel, 0, target - currentPos, totalTransitTime);
            if (myPlan && myPlan.isConsistent()) {
                //we're reaching into the plan here; what we want is the initial acceleration of the plan
                var myInitialAccel = myPlan._acceleration;
                inplaceWindupAccelerations.setByIndex(index, -myInitialAccel, 0);
            }
            else {
                slog(channel, "PoseOffsetFilter(cwa) for " + filteredPose.getDOFNameForIndex(index) + " got invalid plan, dof will have no windup! (currentVel:" + currentVel + ", target:" + target + ", currentPos:" + currentPos + ", totalTransitTime:" + totalTransitTime + ")");
                //should never happen, but still need to act...  skip windup on this dof.
                inplaceWindupAccelerations.setByIndex(index, 0, 0);
            }
        }
        else {
            //we won't try to compute a near zero length path; we'll do no windup
            inplaceWindupAccelerations.setByIndex(index, 0, 0);
        }
    }
};
/**
 * This function takes the per-dof delta to target (in inplaceOvershootDeltas) and scales them down
 * to an appropriate delta to apply as a target overshoot, based on the totalDistanceToTarget,
 * the overshootDistanceRation, and the various limits.
 *
 * @param {Pose} inplaceOvershootDeltas - should start as the delta from current to target for each dof.  will end as the overshoot offset per dof.
 * @param {number} totalDistanceToTarget - total distance from current to target
 * @param {number[]} dofIndices
 * @param {number} overshootDistanceRatio - this fraction of total distance is how much ground our overshoot should cover
 * @param {number} overshootMinDistance - clamp overshoot to this max distance
 * @param {number} overshootMaxDistance - clamp overshoot to this min distance
 * @param {number} epsilon
 */
var scaleOvershootDelta = function (inplaceOvershootDeltas, totalDistanceToTarget, dofIndices, overshootDistanceRatio, overshootMinDistance, overshootMaxDistance, epsilon) {
    /** @type {number} */
    var index;
    /** @type {number} */
    var i;
    //rescale the windup overshoot so total distance is correct
    //we should scale the total overshoot magnitude to be within min/max (per-dof scaling ruins angle)
    if (totalDistanceToTarget > epsilon && overshootDistanceRatio !== 0) {
        var overshootScale = overshootDistanceRatio;
        if (totalDistanceToTarget * overshootScale < overshootMinDistance) {
            overshootScale = 1 / totalDistanceToTarget * overshootMinDistance;
        }
        else if (totalDistanceToTarget * overshootScale > overshootMaxDistance) {
            overshootScale = 1 / totalDistanceToTarget * overshootMaxDistance;
        }
        for (i = 0; i < dofIndices.length; i++) {
            index = dofIndices[i];
            inplaceOvershootDeltas.setByIndex(index, inplaceOvershootDeltas.getByIndex(index, 0) * overshootScale, 0);
        }
    }
    else {
        //distance is zero or close; zero out overshoot for good measure
        for (i = 0; i < dofIndices.length; i++) {
            index = dofIndices[i];
            inplaceOvershootDeltas.setByIndex(index, 0, 0);
        }
    }
};
/**
 * @param {number} advanceSeconds - advance by this many seconds
 * @param {number} totalTransitTime - target this time as the total transit time
 * @param {Pose} targetPose
 * @param {Pose} filteredPose
 * @param {AccelPlanner} accelPlanner
 * @param {Pose} windupAccel
 *
 * @protected
 */
PoseOffsetFilterWindup.prototype._advanceFixedTimeModeWindup = function (advanceSeconds, totalTransitTime, targetPose, filteredPose, accelPlanner, windupAccel, dofIndices) {
    /** @type {number} */
    var index;
    /** @type {number} */
    var i = 0;
    /** @type {number} */
    var currentPos = 0;
    if (this._windupTimeToZeroPRemaining > 0) {
        this._windupTimeToZeroVRemaining = Math.max(0, this._windupTimeToZeroVRemaining - advanceSeconds);
        this._windupTimeToZeroPRemaining = Math.max(0, this._windupTimeToZeroPRemaining - advanceSeconds);
    }
    //if we are winding up, keep winding, otherwise go to target as usual
    if (this._windupTimeRemaining > 0) {
        //console.log("Doing windups, windup remaining time:"+this._windupTimeRemaining+" total time"+totalTransitTime);
        var doWindupTimeNow = Math.min(advanceSeconds, this._windupTimeRemaining);
        this._windupTimeRemaining = Math.max(0, this._windupTimeRemaining - advanceSeconds); //will eventually be === 0 despite any fp error
        advanceSeconds -= doWindupTimeNow; //could end up negative from fp error, but ok, only used to check if greater than epsilon
        //console.log("\tTime remaining this update for regular path:"+advanceSeconds);
        //update filtered pose with wound up position
        for (i = 0; i < dofIndices.length; i++) {
            index = dofIndices[i];
            currentPos = filteredPose.getByIndex(index, 0);
            var currentVel = filteredPose.getByIndex(index, 1);
            var useAccel = windupAccel.getByIndex(index, 0);
            var myPlan = accelPlanner.createPlanWithFixedAccelForever(currentVel, useAccel);
            var windupDisplacement = myPlan.displacementAtTime(doWindupTimeNow);
            var windupNewVelocity = myPlan.velocityAtTime(doWindupTimeNow);
            filteredPose.setByIndex(index, [currentPos + windupDisplacement, windupNewVelocity]);
        }
    }
    if (advanceSeconds > this._epsilon) {
        this._advanceFixedTimeMode(advanceSeconds, totalTransitTime, targetPose, filteredPose, accelPlanner, dofIndices);
    }
};
/**
 * Get the current windup state. See WindupState
 * @returns {WindupState}
 */
PoseOffsetFilterWindup.prototype.getWindupState = function () {
    if (this._windupTimeToZeroPRemaining > 0) {
        if (this._windupTimeRemaining > 0) {
            return WindupState.WINDING_ACCEL;
        }
        else if (this._windupTimeToZeroVRemaining > 0) {
            return WindupState.WINDING_DECEL;
        }
        else {
            return WindupState.WINDING_RESTORING;
        }
    }
    else {
        return WindupState.NONE;
    }
};
/**
 * @param {number} seconds
 * @override
 */
PoseOffsetFilterWindup.prototype.updateByTime = function (seconds) {
    var dofIndices = this._dofIndices;
    var dofIndicesLength = this._dofIndices.length;
    var index;
    /**
     * useTarget will either be the normal target, or an overshoot target computed from normal target modified
     * and the overshootDelta
     *
     * @type {Pose}
     */
    var useTarget = this._targetPose;
    if (this._shouldStartWindup && (this._weAreOvershooting || this._windupTimeRemaining > 0)) {
        //we are asked to start a new windup/overshoot trajectory.
        //this will either be ignore (if we are moving too fast) or cause an actual windup/overshoot.
        //For now, we cancel any existing windup/overshoot state, although in some cases the old
        //windup/overshoot and new windup/overshoot could be integrated where they would overlap.
        this._weAreOvershooting = false;
        this._windupTimeRemaining = 0; //cancel the existing windup if asked for a new trajectory when currently winding
        this._windupTimeToZeroVRemaining = 0;
        this._windupTimeToZeroPRemaining = 0;
        slog(channel, "PoseOffsetFilterWindup: cancelling existing windup/overshoot plan, asked for a new one during execution");
    }
    if (this._weAreOvershooting) {
        //modify our target if we are overshooting!
        var anyOvershootStillValid = false;
        //overshootModifiedTarget.setPose(targetPose);
        for (var i = 0; i < dofIndicesLength; i++) {
            index = dofIndices[i];
            var overshootDelta = this._targetOvershootDelta.getByIndex(index, 0);
            var unmodifiedTarget = this._targetPose.getByIndex(index, 0);
            var currentPos = this._filteredPose.getByIndex(index, 0);
            var deltaToTarget = unmodifiedTarget - currentPos;
            if ((deltaToTarget > 0 && overshootDelta > 0) || (deltaToTarget < 0 && overshootDelta < 0)) {
                //same sign, still target an overshoot
                anyOvershootStillValid = true;
                this._overshootModifiedTarget.setByIndex(index, unmodifiedTarget + overshootDelta, 0);
            }
            else {
                this._overshootModifiedTarget.setByIndex(index, unmodifiedTarget, 0);
            }
        }
        if (!anyOvershootStillValid) {
            this._weAreOvershooting = false;
            //console.log("dropping overshoot offset target now as we are past the target");
        }
        else {
            useTarget = this._overshootModifiedTarget;
        }
    }
    var transitionTime = this._timeForLongestDOF(useTarget, this._filteredPose, this._accelPlanner, this._accLimit, dofIndices);
    if (this._shouldStartWindup) {
        //we will start now or not, based on current position/velocity and position-target relationship
        //whether we fire or not, we're cancelling the should-start, not delaying it for later.
        //times/distances used to define windup/overshoot magnitude are based on the "natural" current->target times,
        //as computed above, since overshoot will have been cancelled for this last planning session.
        //if we do trigger a windup/overshoot, for the first tick the above plans do not include overshoot target as
        //they should but that is not a concern because the difference in target position will not make much or any
        //difference on the first update
        this._shouldStartWindup = false;
        var okToStart = checkTrajectoryStartCriteria(this._targetPose, this._filteredPose, dofIndices, this._maxAllowedTriggerSpeed, this._minAllowedTriggerDistance, this._maxAllowedTriggerDistance);
        if (okToStart) {
            var totalDistance = computeTotalDistanceToTarget(this._targetPose, this._filteredPose, this._targetOvershootDelta, dofIndices, this._epsilon);
            if (this._overshootDistanceRatio > 0) {
                scaleOvershootDelta(this._targetOvershootDelta, totalDistance, dofIndices, this._overshootDistanceRatio, this._overshootMinDistance, this._overshootMaxDistance, this._epsilon);
                this._weAreOvershooting = true;
            }
            if (this._windupDistanceRatio !== 0) {
                computeWindupAccelerations(transitionTime, this._targetPose, this._filteredPose, this._accelPlanner, this._windupAccel, dofIndices, this._epsilon);
                this._windupTimeRemaining = computeWindupTime(this._windupAccel, totalDistance, this._windupDistanceRatio, this._windupMinDistance, this._windupMaxDistance, dofIndices);
                this._windupTimeToZeroVRemaining = this._windupTimeRemaining * 2;
                this._windupTimeToZeroPRemaining = this._windupTimeRemaining * Math.sqrt(2) + this._windupTimeToZeroVRemaining;
            }
        }
        else {
            //console.log("rejecting start of windup trajectory");
            this._weAreOvershooting = false;
            this._windupTimeRemaining = 0;
            this._windupTimeToZeroVRemaining = 0;
            this._windupTimeToZeroPRemaining = 0;
        }
    }
    this._advanceFixedTimeModeWindup(seconds, transitionTime, useTarget, this._filteredPose, this._accelPlanner, this._windupAccel, dofIndices);
};
module.exports = PoseOffsetFilterWindup;

},{"../../ifr-core/SLog":57,"../base/Pose":78,"./PoseOffsetFilter":116}],118:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var PointADOF = require("./PointADOF");
var LookatDOF = require("./LookatDOF");
/**
 *
 * @param {string} name
 * @param {string} controlledDOFName
 * @param {THREE.Vector3} forwardDirection
 * @extends LookatDOF
 * @constructor
 */
var RotationalLookatDOF = function (name, controlledDOFName, forwardDirection) {
    LookatDOF.call(this, name, controlledDOFName);
    /** @type {RotationControl} */
    this._control = null;
    /**	@type {THREE.Vector3} */
    this._forwardDir = forwardDirection;
    /** @type {THREE.Object3D} */
    this._transform = null;
    /** @type {THREE.Vector3} */
    this._axis = null;
};
RotationalLookatDOF.prototype = Object.create(LookatDOF.prototype);
RotationalLookatDOF.prototype.constructor = RotationalLookatDOF;
/**
 * @param {KinematicGroup} kinematicGroup group to use for kinematic math (assumed to be configured as desired before valToPointAtTarget calls)
 */
RotationalLookatDOF.prototype.connectToGroup = function (kinematicGroup) {
    LookatDOF.prototype.connectToGroup.call(this, kinematicGroup);
    if (this._kinematicGroup) {
        this._control = this._kinematicGroup.getModelControlGroup().getControlForDOF(this._controlledDOFName);
        this._transform = this._kinematicGroup.getTransform(this._control.getTransformName());
        this._axis = new THREE.Vector3();
        this._control.getRotationalAxis(this._axis);
    }
    else {
        this._transform = null;
        this._control = null;
        this._axis = null;
    }
};
/**
 * Compute value is relative to current setup of the hierarchy that this._transform is part of.
 *
 * @param {THREE.Vector3} target
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @param {Pose} [currentPose] - currentPose of the bot, should be same as pose represented by associated kinematic group
 * @return {number} Value to cause this._control to point local this._forwardDir at the target
 * @override
 */
RotationalLookatDOF.prototype.valToPointAtTarget = function (target, pointReport, currentPose) {
    return PointADOF.pointDOF(this._control, this._transform, this._forwardDir, target, pointReport);
};
/**
 * Provide the ratio that this error represents for the range of motion of this LookatDOF.
 * For cyclic dofs, range is considered one revolution.
 *
 * @param errorAbsolute absolute error
 * @return {number} ratio that absoluteError represents of the total range of this LookatDOF
 * @override
 */
RotationalLookatDOF.prototype.errorRatio = function (errorAbsolute) {
    if (this._control.isCyclic()) {
        return Math.abs(errorAbsolute / (Math.PI * 2));
    }
    else {
        return Math.abs(errorAbsolute / (this._control.getMax() - this._control.getMin()));
    }
};
/**
 * provide a suggestion for a target that is forward for this lookat (node is already looking at this point)
 * @param {THREE.Vector3} inplaceVec
 * @return {THREE.Vector3}
 * @override
 */
RotationalLookatDOF.prototype.suggestForwardTarget = function (inplaceVec) {
    if (this._transform == null) {
        return null;
    }
    else {
        inplaceVec.copy(this._forwardDir);
        inplaceVec.multiplyScalar(10);
        this._transform.localToWorld(inplaceVec);
        return inplaceVec;
    }
};
module.exports = RotationalLookatDOF;

},{"./LookatDOF":103,"./PointADOF":115,"@jibo/three":undefined}],119:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var PointADOF = require("./PointADOF");
var LookatDOF = require("./LookatDOF");
var ExtraMath = require("../../ifr-geometry/ExtraMath");
var CyclicMath = require("../../ifr-motion/base/CyclicMath");
/**
 *
 * @param {string} name
 * @param {string} controlledDOFName
 * @param {THREE.Vector3} planeNormal
 * @param {number} distanceAlongDOFAxisToPlane
 * @param {number} angleAbovePlane
 * @param {boolean} chooseCloserSolution
 * @extends LookatDOF
 * @constructor
 */
var RotationalPlaneAlignmentLookatDOF = function (name, controlledDOFName, planeNormal, distanceAlongDOFAxisToPlane, angleAbovePlane, chooseCloserSolution) {
    LookatDOF.call(this, name, controlledDOFName);
    /** @type {RotationControl} */
    this._control = null;
    /**	@type {THREE.Vector3} */
    this._planeNormal = planeNormal;
    /**	@type {number} */
    this._distanceAlongDOFAxisToPlane = distanceAlongDOFAxisToPlane;
    /**	@type {number} */
    this._angleAbovePlane = angleAbovePlane;
    /** @type {THREE.Object3D} */
    this._transform = null;
    /** @type {boolean} */
    this._chooseCloserSolution = chooseCloserSolution;
};
RotationalPlaneAlignmentLookatDOF.prototype = Object.create(LookatDOF.prototype);
RotationalPlaneAlignmentLookatDOF.prototype.constructor = RotationalPlaneAlignmentLookatDOF;
/**
 * @param {KinematicGroup} kinematicGroup group to use for kinematic math (assumed to be configured as desired before valToPointAtTarget calls)
 */
RotationalPlaneAlignmentLookatDOF.prototype.connectToGroup = function (kinematicGroup) {
    LookatDOF.prototype.connectToGroup.call(this, kinematicGroup);
    if (kinematicGroup) {
        this._control = this._kinematicGroup.getModelControlGroup().getControlForDOF(this._controlledDOFName);
        this._transform = this._kinematicGroup.getTransform(this._control.getTransformName());
    }
    else {
        this._transform = null;
        this._control = null;
    }
};
/**
 * Compute value is relative to current setup of the hierarchy that this._transform is part of.
 *
 * @param {THREE.Vector3} target
 * @param {PointReport} [pointReport] - inplace arg to return metadata about computation
 * @param {Pose} [currentPose] - currentPose of the bot, should be same as pose represented by associated kinematic group
 * @return {number} Value to cause this._control to point local this._forwardDir at the target
 * @override
 */
RotationalPlaneAlignmentLookatDOF.prototype.valToPointAtTarget = function (target, pointReport, currentPose) {
    var values = PointADOF.pointDOFToIntersectConeWithPoint(this._control, this._transform, this._planeNormal, this._distanceAlongDOFAxisToPlane, target, this._angleAbovePlane, true, pointReport);
    if (values && values.length > 0) {
        var val = values[0];
        if (values.length > 1 && this._chooseCloserSolution) {
            var currentDOFValue = CyclicMath.closestEquivalentRotation(currentPose.get(this._controlledDOFName, 0), 0);
            var v1 = CyclicMath.closestEquivalentRotation(values[0], currentDOFValue);
            var v2 = CyclicMath.closestEquivalentRotation(values[1], currentDOFValue);
            if (Math.abs(v1 - currentDOFValue) <= Math.abs(v2 - currentDOFValue)) {
                val = v1;
            }
            else {
                val = v2;
            }
            //if(pointReport!==null){
            //	pointReport.solution1 = v1;
            //	pointReport.solution2 = v2;
            //}
        }
        return val;
    }
};
/**
 * Provide the ratio that this error represents for the range of motion of this LookatDOF.
 * For cyclic dofs, range is considered one revolution.
 *
 * @param errorAbsolute absolute error
 * @return {number} ratio that absoluteError represents of the total range of this LookatDOF
 * @override
 */
RotationalPlaneAlignmentLookatDOF.prototype.errorRatio = function (errorAbsolute) {
    if (this._control.isCyclic()) {
        return Math.abs(errorAbsolute / (Math.PI * 2));
    }
    else {
        return Math.abs(errorAbsolute / (this._control.getMax() - this._control.getMin()));
    }
};
/**
 * provide a suggestion for a target that is forward for this lookat (node is already looking at this point)
 * @param {THREE.Vector3} inplaceVec
 * @return {THREE.Vector3}
 * @override
 */
RotationalPlaneAlignmentLookatDOF.prototype.suggestForwardTarget = function (inplaceVec) {
    if (this._transform == null) {
        return null;
    }
    else {
        //TODO: cache results and variables
        var origin = new THREE.Vector3();
        this._control.getRotationalAxis(origin);
        var perp = new THREE.Vector3();
        ExtraMath.findOrthogonal(this._planeNormal, perp);
        var coneItAxis = new THREE.Vector3();
        coneItAxis.crossVectors(perp, this._planeNormal);
        var coneItRot = new THREE.Quaternion();
        ExtraMath.quatFromAxisAngle(coneItAxis, this._angleAbovePlane, coneItRot);
        perp.applyQuaternion(coneItRot);
        origin.setLength(this._distanceAlongDOFAxisToPlane);
        perp.setLength(10);
        inplaceVec.copy(perp);
        inplaceVec.add(origin);
        this._transform.localToWorld(perp);
        return inplaceVec;
    }
};
module.exports = RotationalPlaneAlignmentLookatDOF;

},{"../../ifr-geometry/ExtraMath":62,"../../ifr-motion/base/CyclicMath":70,"./LookatDOF":103,"./PointADOF":115,"@jibo/three":undefined}],120:[function(require,module,exports){
/**
/**
 * @author jg
 * Copyright 2017 IF Robots LLC
 */
"use strict";
var slog = require("../../ifr-core/SLog");
var THREE = require("@jibo/three");
var channel = "LOOKAT";
/**
 *
 * @param {number} left - shift target left this many radians (negative for right)
 * @param {number} down - shift target down this many radians (negative for up)
 * @param {THREE.Vector3} upDir - world up vector to define what left/down mean.  left will be RHR (anticlockwise) of up.
 * @constructor
 */
var WorldTargetAdjuster = function (left, down, upDir) {
    this._left = left;
    this._down = down;
    this._up = upDir;
};
/**
 * @param {Pose} currentPose
 * @param {THREE.Vector3} target
 * @return {THREE.Vector3}
 */
WorldTargetAdjuster.prototype.getAdjustedTarget = function (currentPose, target) {
    var result = target.clone();
    if (this._left !== 0) {
        var leftRot = new THREE.Quaternion().setFromAxisAngle(this._up, this._left);
        result = result.applyQuaternion(leftRot);
    }
    if (this._down !== 0) {
        /** @type {THREE.Vector3} */
        var axis = this._up.clone().cross(result);
        if (axis.length() < 0.0001) {
            slog.log(channel, "WorldTargetAdjuster not adjusting target up/down, we're near singularity");
        }
        else {
            axis.normalize();
            var downRot = new THREE.Quaternion().setFromAxisAngle(axis, this._down);
            result = result.applyQuaternion(downRot);
        }
    }
    return result;
};
module.exports = WorldTargetAdjuster;

},{"../../ifr-core/SLog":57,"@jibo/three":undefined}],121:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var TrackPolicyTrigger = require("./TrackPolicyTrigger");
/**
 * Enum Values for track mode, informs Lookat to go to target or delay motion.
 * @enum {string}
 */
var TrackMode = {
    /**
     * Go to target
     */
    TRACK: "TRACK",
    /**
     * Go to target, hint that target is a large motion away
     */
    TRACK_SACCADE: "TRACK_SACCADE",
    /**
     * Hold current position, no definite future motion planned
     */
    HOLD: "HOLD",
    /**
     * Hold current position, expecting to move in time
     */
    DELAY: "DELAY"
};
/**
 * This class is responsible for computing the track state for a single lookat node based on the
 * policy for that particular node.  For example, one node may immediately track towards targets
 * that are sufficiently far away, but ignore small changes in the target position, while another node
 * might track towards any deviation no matter how small.
 *
 * Along with tracking vs holding, the policy can provide hints that help with events and other lookat behavior.
 * track can be TRACK or TRACK_SACCADE; both indicate that the node should track, but the latter indicates
 * a motion to new/distant target, and could be a good time to trigger additional behavior such as a blink.
 * Hold can be HOLD or DELAY; both indicate that the node should hold, but the latter indicates that the policy
 * is expecting to move and is waiting for time to pass first, so behaviors waiting for a lookat to fully
 * complete may want to consider this node as still "in progress" even though it is not yet moving.
 *
 * @param {TrackPolicyTrigger[]} checkers
 * @constructor
 */
var LookatNodeTrackPolicy = function (checkers) {
    /** @type {TrackMode|string}
     * @private */
    this._currentMode = TrackMode.HOLD;
    /** @type {TrackPolicyTrigger[]}
     * @private */
    this._checkers = checkers;
    /** @type {Time}
     * @private */
    this._lastTime = null;
    /**
     *
     * @type {TrackPolicyListener[]}
     * @private
     */
    this._trackPolicyListeners = null;
};
LookatNodeTrackPolicy.TrackMode = TrackMode;
/**
 *
 * @param {TrackPolicyListener} trackListener
 */
LookatNodeTrackPolicy.prototype.addListener = function (trackListener) {
    if (this._trackPolicyListeners === null) {
        this._trackPolicyListeners = [];
    }
    if (this._trackPolicyListeners.indexOf(trackListener) === -1) {
        this._trackPolicyListeners.push(trackListener);
    }
};
/**
 *
 * @param {TrackPolicyListener} trackListener
 */
LookatNodeTrackPolicy.prototype.removeListener = function (trackListener) {
    if (this._trackPolicyListeners !== null) {
        var index = this._trackPolicyListeners.indexOf(trackListener);
        if (index !== -1) {
            this._trackPolicyListeners.splice(index, 1);
        }
        if (this._trackPolicyListeners.length === 0) {
            this._trackPolicyListeners = null;
        }
    }
};
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport distance report
 * @param {Time} time - time
 * @return {TrackMode}
 */
LookatNodeTrackPolicy.prototype.computeMode = function (lookatNodeDistanceReport, time) {
    var startLaterIndicated = false;
    var i;
    var timeDelta = 0;
    if (this._lastTime !== null) {
        timeDelta = time.subtract(this._lastTime);
    }
    this._lastTime = time;
    if (this._currentMode === TrackMode.HOLD) {
        var shouldStart = false;
        for (i = 0; i < this._checkers.length; i++) {
            var startChecker = this._checkers[i];
            var startStatus = startChecker.shouldStartTracking(lookatNodeDistanceReport, timeDelta);
            if (startStatus === TrackPolicyTrigger.StartStatus.YES) {
                shouldStart = true;
            }
            if (startStatus === TrackPolicyTrigger.StartStatus.LATER) {
                startLaterIndicated = true;
            }
        }
        if (shouldStart) {
            this._start(time);
        }
    }
    else if (this._currentMode === TrackMode.TRACK) {
        var anyWishToContinue = false;
        for (i = 0; i < this._checkers.length; i++) {
            var stopChecker = this._checkers[i];
            var stopStatus = stopChecker.shouldStopTracking(lookatNodeDistanceReport, timeDelta);
            if (stopStatus === false) {
                anyWishToContinue = true;
            }
        }
        if (!anyWishToContinue) {
            this._stop(time);
        }
    }
    var ret;
    if (this._currentMode === TrackMode.HOLD && startLaterIndicated) {
        ret = TrackMode.DELAY;
    }
    else {
        ret = this._currentMode;
    }
    if (this._trackPolicyListeners !== null) {
        for (i = 0; i < this._trackPolicyListeners.length; i++) {
            this._trackPolicyListeners[i].notifyTrackMode(ret);
        }
    }
    return ret;
};
//TODO: when do we reset??
LookatNodeTrackPolicy.prototype.reset = function () {
    for (var i = 0; i < this._checkers.length; i++) {
        this._checkers[i].reset();
    }
    this._lastTime = null;
};
/**
 *
 * @returns {boolean} true if this policy has had a chance to update since its last reset
 */
LookatNodeTrackPolicy.prototype.hasBeenUpdatedSinceReset = function () {
    return this._lastTime !== null;
};
/**
 * @param time
 * @private
 */
LookatNodeTrackPolicy.prototype._start = function (time) {
    this._currentMode = TrackMode.TRACK;
    this.reset();
    if (this._trackPolicyListeners !== null) {
        for (var i = 0; i < this._trackPolicyListeners.length; i++) {
            this._trackPolicyListeners[i].notifyTrackStarted();
        }
    }
};
/**
 * @param time
 * @private
 */
LookatNodeTrackPolicy.prototype._stop = function (time) {
    this._currentMode = TrackMode.HOLD;
    this.reset();
    if (this._trackPolicyListeners !== null) {
        for (var i = 0; i < this._trackPolicyListeners.length; i++) {
            this._trackPolicyListeners[i].notifyTrackStopped();
        }
    }
};
module.exports = LookatNodeTrackPolicy;

},{"./TrackPolicyTrigger":122}],122:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
/**
 * Enum Values for track mode, informs Lookat to go to target or delay motion.
 * @enum {string}
 */
var StartStatus = {
    /**
     * Go to target
     */
    YES: "YES",
    /**
     * Do not go to target
     */
    NO: "NO",
    /**
     * Do not go to target, but hint that we are planning to trigger after a delay
     */
    LATER: "LATER"
};
var TrackPolicyTrigger = function () {
};
TrackPolicyTrigger.StartStatus = StartStatus;
/* superclass definition:        */
/* eslint-disable no-unused-vars */
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {?StartStatus}
 */
TrackPolicyTrigger.prototype.shouldStartTracking = function (lookatNodeDistanceReport, timeDelta) {
    return null;
};
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {?boolean}
 */
TrackPolicyTrigger.prototype.shouldStopTracking = function (lookatNodeDistanceReport, timeDelta) {
    return null;
};
/**
 * Called to notify trigger to reset state (start/end of lookat)
 */
TrackPolicyTrigger.prototype.reset = function () {
};
module.exports = TrackPolicyTrigger;

},{}],123:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var TrackPolicyTrigger = require("./TrackPolicyTrigger");
/**
 * @constructor
 * @extends TrackPolicyTrigger
 */
var TrackPolicyTriggerAlways = function () {
    TrackPolicyTrigger.call(this);
};
TrackPolicyTriggerAlways.prototype = Object.create(TrackPolicyTrigger.prototype);
TrackPolicyTriggerAlways.prototype.constructor = TrackPolicyTriggerAlways;
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {StartStatus}
 * @override
 */
TrackPolicyTriggerAlways.prototype.shouldStartTracking = function (lookatNodeDistanceReport, timeDelta) {
    return TrackPolicyTrigger.StartStatus.YES;
};
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {?boolean}
 */
TrackPolicyTriggerAlways.prototype.shouldStopTracking = function (lookatNodeDistanceReport, timeDelta) {
    return false;
};
module.exports = TrackPolicyTriggerAlways;

},{"./TrackPolicyTrigger":122}],124:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var TrackPolicyTrigger = require("./TrackPolicyTrigger");
/**
 * Track policy based on accumulating discomfort based on distance between current and optimal-position-for-target (delta).
 * Track is triggered when accumulation reaches 1.  Accumulation increases at a rate computed by linearly interpolating
 * from accumInner to accumOuter based on our delta's position between innerLimit and outerLimit.
 *
 * Track can be triggered immediately if "delta > outerLimit" and moveImmediatelyPastOuter is true.  (Otherwise accumulation
 * proceeds as if delta = outerLimit).  accumInner and accumOuter are in units/second.
 *
 *
 * @param {number} innerLimit - never move if delta < innerLimit.  innerLimit associates with accumInner for discomfort accumulation.
 * @param {number} outerLimit - outerLimit associates with accumOuter for discomfort accumulation.  Optionally move immediately if delta > outerLimit (see moveImmediatelyPastOuter)
 * @param {number} accumInner - accumulate discomfort at this rate when "delta = innerLimit"
 * @param {number} accumOuter - accumulate discomfort at this rate when "delta = outerLimit"
 * @param {boolean} moveImmediatelyPastOuter - if true, track immediately if "delta > outerLimit".  Otherwise accumulated discomfort as if delta = outerLimit.
 * @constructor
 * @extends TrackPolicyTrigger
 */
var TrackPolicyTriggerDiscomfort = function (innerLimit, outerLimit, accumInner, accumOuter, moveImmediatelyPastOuter) {
    TrackPolicyTrigger.call(this);
    /** @type {number}
     * @private */
    this._limitInner = innerLimit;
    /** @type {number}
     * @private */
    this._limitOuter = outerLimit;
    /** @type {number}
     * @private */
    this._accumValueInner = accumInner;
    /** @type {number}
     * @private */
    this._accumValueOuter = accumOuter;
    /** @type {boolean}
     * @private */
    this._moveImmediatelyPastOuter = moveImmediatelyPastOuter;
    /** @type {number}
     * @private */
    this._accumValueCurrent = 0;
};
TrackPolicyTriggerDiscomfort.prototype = Object.create(TrackPolicyTrigger.prototype);
TrackPolicyTriggerDiscomfort.prototype.constructor = TrackPolicyTriggerDiscomfort;
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {StartStatus}
 * @override
 */
TrackPolicyTriggerDiscomfort.prototype.shouldStartTracking = function (lookatNodeDistanceReport, timeDelta) {
    var status = null;
    var distance = lookatNodeDistanceReport.highestDistanceHoldToOptimal;
    if (distance < this._limitInner) {
        this._accumValueCurrent = 0;
        status = TrackPolicyTrigger.StartStatus.NO;
    }
    else {
        if (distance >= this._limitOuter && this._moveImmediatelyPastOuter) {
            this._accumValueCurrent = 1;
            status = TrackPolicyTrigger.StartStatus.YES;
        }
        else if (this._limitOuter > this._limitInner) {
            //clamp
            distance = Math.max(this._limitInner, Math.min(this._limitOuter, distance));
            var alpha = (distance - this._limitInner) / (this._limitOuter - this._limitInner);
            var toAccum = (1 - alpha) * this._accumValueInner + alpha * this._accumValueOuter;
            this._accumValueCurrent += (toAccum * timeDelta);
            if (this._accumValueCurrent > 1) {
                status = TrackPolicyTrigger.StartStatus.YES;
            }
            else {
                status = TrackPolicyTrigger.StartStatus.LATER;
            }
        }
    }
    return status;
};
/**
 * Called to notify trigger to reset state
 */
TrackPolicyTriggerDiscomfort.prototype.reset = function () {
    this._accumValueCurrent = 0;
};
module.exports = TrackPolicyTriggerDiscomfort;

},{"./TrackPolicyTrigger":122}],125:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var TrackPolicyTrigger = require("./TrackPolicyTrigger");
/**
 * @param {number} deadZone
 * @param {number} deadTime;
 * @param {number} deadVelocity;
 * @constructor
 * @extends TrackPolicyTrigger
 */
var TrackPolicyTriggerMovementTerminated = function (deadZone, deadTime, deadVelocity) {
    TrackPolicyTrigger.call(this);
    /**@type {number}
     * @private */
    this._deadZone = deadZone;
    /**@type {number}
     * @private */
    this._deadTime = deadTime;
    /**@type {number}
     * @private */
    this._deadVelocity = deadVelocity;
    /**@type {number}
     * @private */
    this._deadTimeAccumulated = 0;
};
TrackPolicyTriggerMovementTerminated.prototype = Object.create(TrackPolicyTrigger.prototype);
TrackPolicyTriggerMovementTerminated.prototype.constructor = TrackPolicyTriggerMovementTerminated;
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {?boolean}
 */
TrackPolicyTriggerMovementTerminated.prototype.shouldStopTracking = function (lookatNodeDistanceReport, timeDelta) {
    var distance = lookatNodeDistanceReport.highestDistanceOptimalToFiltered;
    var velocity = lookatNodeDistanceReport.highestVelocityFiltered;
    if (distance <= this._deadZone && velocity <= this._deadVelocity) {
        this._deadTimeAccumulated += timeDelta;
    }
    else {
        this._deadTimeAccumulated = 0;
    }
    return this._deadTimeAccumulated > this._deadTime;
};
/**
 * Called to notify trigger to reset state
 */
TrackPolicyTriggerMovementTerminated.prototype.reset = function () {
    this._deadTimeAccumulated = 0;
};
module.exports = TrackPolicyTriggerMovementTerminated;

},{"./TrackPolicyTrigger":122}],126:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var TrackPolicyTrigger = require("./TrackPolicyTrigger");
/**
 *
 * @constructor
 * @extends TrackPolicyTrigger
 * @implements TrackPolicyListener
 */
var TrackPolicyTriggerOnOtherNode = function () {
    TrackPolicyTrigger.call(this);
    /**
     * True whenever one or more other monitored nodes are tracking
     * Assumes that other nodes are updated as often as this node, as
     * state is cleared whenever we are queried.
     *
     * @type {boolean}
     * @private
     */
    this._otherNodeIsTracking = false;
    /**
     * Enables/disables the functionality of this trigger
     * @type {boolean}
     * @private
     */
    this._triggerThisNodeWhenOtherTracks = true;
};
TrackPolicyTriggerOnOtherNode.prototype = Object.create(TrackPolicyTrigger.prototype);
TrackPolicyTriggerOnOtherNode.prototype.constructor = TrackPolicyTriggerOnOtherNode;
/**
 * Enabled/disable this trigger
 * @param {boolean} trigger
 */
TrackPolicyTriggerOnOtherNode.prototype.setTriggerThisNodeOnOtherNode = function (trigger) {
    this._triggerThisNodeWhenOtherTracks = trigger;
};
/**
 *
 * @param {LookatNodeDistanceReport} lookatNodeDistanceReport
 * @param {number} timeDelta
 * @return {StartStatus}
 * @override
 */
TrackPolicyTriggerOnOtherNode.prototype.shouldStartTracking = function (lookatNodeDistanceReport, timeDelta) {
    var r = null;
    if (this._otherNodeIsTracking && this._triggerThisNodeWhenOtherTracks) {
        r = TrackPolicyTrigger.StartStatus.YES;
    }
    else {
        r = TrackPolicyTrigger.StartStatus.NO;
    }
    this._otherNodeIsTracking = false;
    return r;
};
/**
 * Will be called when the TrackPolicy starts a track
 */
TrackPolicyTriggerOnOtherNode.prototype.notifyTrackStarted = function () { };
/**
 * Will be called when the TrackPolicy stops tracking
 */
TrackPolicyTriggerOnOtherNode.prototype.notifyTrackStopped = function () { };
/**
 * Called each time a TrackPolicy updates, passes in current mode
 * @param {TrackMode} trackMode
 */
TrackPolicyTriggerOnOtherNode.prototype.notifyTrackMode = function (trackMode) {
    if (trackMode === "TRACK") {
        this._otherNodeIsTracking = true;
    }
};
module.exports = TrackPolicyTriggerOnOtherNode;

},{"./TrackPolicyTrigger":122}],127:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var GLLinePool = require("./GLLinePool");
/**
 *
 * @param {THREE.Vector3} groundPlaneNormal
 * @constructor
 */
var AnchoredTargetVisualizer = function (groundPlaneNormal) {
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._groundPlaneNormal = groundPlaneNormal;
    /**
     * @type {?THREE.Vector3}
     * @private
     */
    this._target = null;
    /**
     * @type {GLLinePool}
     * @private
     */
    this._linePool = null;
    /**
     * @function
     * @private
     */
    this._renderCallback = null;
    /**
     * @type {number}
     * @private
     */
    this._lineWidth = 1;
    /**
     * @type {number}
     * @private
     */
    this._brightness = 1;
    /**
     * @type {THREE.Color}
     * @private
     */
    this._baseColor = new THREE.Color(1, 0, 1);
};
/**
 * @param {THREE.Vector3} position
 */
AnchoredTargetVisualizer.prototype.setPosition = function (position) {
    if (this._target === null && position !== null) {
        this._target = new THREE.Vector3(position.x, position.y, position.z);
    }
    else if (position == null) {
        this._target = null;
    }
    else {
        this._target.copy(position);
    }
};
/**
 * Install a renderer into scene that will draw this target.
 *
 * @param {BasicScene} scene
 */
AnchoredTargetVisualizer.prototype.installRendererIntoScene = function (scene) {
    if (this._linePool != null || this._renderCallback != null) {
        throw new Error("Remove VTP renderer from existing scene before installing in another!");
    }
    this._linePool = new GLLinePool(scene, 10);
    var self = this;
    this._renderCallback = function () {
        if (self._target != null) {
            var target = self._target;
            var brightness = self._brightness;
            var baseColor = self._baseColor;
            self._linePool.setLineWidth(self._lineWidth);
            var scale = 0.05;
            self._linePool.drawOnce(new THREE.Vector3().copy(target).add(new THREE.Vector3(scale, 0, 0)), new THREE.Vector3().copy(target).sub(new THREE.Vector3(scale, 0, 0)), new THREE.Color(1 * brightness, 0, 0));
            self._linePool.drawOnce(new THREE.Vector3().copy(target).add(new THREE.Vector3(0, scale, 0)), new THREE.Vector3().copy(target).sub(new THREE.Vector3(0, scale, 0)), new THREE.Color(0, 1 * brightness, 0));
            self._linePool.drawOnce(new THREE.Vector3().copy(target).add(new THREE.Vector3(0, 0, scale)), new THREE.Vector3().copy(target).sub(new THREE.Vector3(0, 0, scale)), new THREE.Color(0.2 * brightness, 0.2 * brightness, 1 * brightness));
            var groundTarget = new THREE.Vector3().copy(target).projectOnPlane(self._groundPlaneNormal);
            self._linePool.drawOnce(new THREE.Vector3().copy(groundTarget).add(new THREE.Vector3(scale, scale, 0)), new THREE.Vector3().copy(groundTarget).sub(new THREE.Vector3(scale, scale, 0)), new THREE.Color(baseColor.r * brightness, baseColor.g * brightness, baseColor.b * brightness));
            self._linePool.drawOnce(new THREE.Vector3().copy(groundTarget).add(new THREE.Vector3(scale, -scale, 0)), new THREE.Vector3().copy(groundTarget).sub(new THREE.Vector3(scale, -scale, 0)), new THREE.Color(baseColor.r * brightness, baseColor.g * brightness, baseColor.b * brightness));
            self._linePool.drawOnce(groundTarget, target, new THREE.Color(baseColor.r * brightness, baseColor.g * brightness, baseColor.b * brightness));
        }
    };
    scene.addRenderCallback(this._renderCallback);
};
/**
 * Remove the renderer from this scene.
 *
 * @param {BasicScene} scene
 */
AnchoredTargetVisualizer.prototype.removeRendererFromScene = function (scene) {
    if (this._linePool != null) {
        this._linePool.removeFromScene(scene);
    }
    if (this._renderCallback != null) {
        scene.removeRenderCallback(this._renderCallback);
    }
    this._linePool = null;
    this._renderCallback = null;
};
/**
 * @param {number} width
 */
AnchoredTargetVisualizer.prototype.setLineWidth = function (width) {
    this._lineWidth = width;
};
/**
 * @param {number} brightness
 */
AnchoredTargetVisualizer.prototype.setBrightness = function (brightness) {
    this._brightness = brightness;
};
/**
 * @param {THREE.Color} baseColor
 */
AnchoredTargetVisualizer.prototype.setBaseColor = function (baseColor) {
    this._baseColor.set(baseColor);
};
module.exports = AnchoredTargetVisualizer;

},{"./GLLinePool":129,"@jibo/three":undefined}],128:[function(require,module,exports){
/**
 * @author mattb
 * Copyright 2014 IF Robots LLC
 */
"use strict";
var TrackballControls = require("./TrackballControls");
var THREE = require("@jibo/three");
var Stats = require("stats-js");
/**
 * @param {HTMLElement} containerElement
 * @param {boolean} installControls
 * @param {boolean} installStats
 * @param {THREE.Color} clearColor
 * @constructor
 */
var BasicScene = function (containerElement, installControls, installStats, clearColor) {
    /** @type {HTMLElement} */
    this._container = (containerElement !== undefined) ? containerElement : null;
    if (this._container) {
        var box = this._container.getBoundingClientRect();
        this._width = box.width;
        this._height = box.height;
    }
    else {
        this._width = 100;
        this._height = 100;
    }
    /**
     * Sometimes the element appears ready, and the rendering "happens", but doesn't show up.
     * In those cases, if we're in "renderOnlyWhenDirty", there will be a long time with no eye rendered (until it next moves)
     * @type {boolean}
     * @private
     */
    this._workaroundElementReadyRace = true;
    /** @type {THREE.PerspectiveCamera} */
    this._camera = new THREE.PerspectiveCamera(60, this._width / this._height, 0.1, 1000);
    this._camera.position.z = 20;
    /** @type {THREE.Scene} */
    this._scene = new THREE.Scene();
    /** @type {THREE.AmbientLight} */
    this._ambientLight = new THREE.AmbientLight(0x404040);
    this._scene.add(this._ambientLight);
    /** @type {THREE.DirectionalLight} */
    this._directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this._directionalLight.position.set(-1, 1, 1);
    this._scene.add(this._directionalLight);
    /** @type {THREE.WebGLRenderer} */
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setSize(this._width, this._height);
    if (clearColor) {
        this._renderer.setClearColor(clearColor);
    }
    /** @type {boolean} */
    this._renderOnlyWhenDirty = false;
    /** @type {boolean} */
    this._dirty = true;
    /** @type {number} */
    this._renderEveryNFRames = 1;
    /** @type {number} */
    this._frameSkipCounter = 0;
    if (this._container) {
        this._container.appendChild(this._renderer.domElement);
        if (this._workaroundElementReadyRace) {
            setTimeout(this.markDirty.bind(this), 200);
        }
    }
    /** @type {Array} */
    this._renderCallbacks = [];
    /** @type {Array} */
    this._postRenderCallbacks = [];
    /** @type TrackballControls */
    this._controls = null;
    if (installControls) {
        this.installTrackballControls();
    }
    /** @type {Stats} */
    this._stats = null;
    if (installStats) {
        this.installStats();
    }
    this._doPlay = this.play.bind(this);
    this._markDirty = this.markDirty.bind(this);
    //this._doResize = function(){self.handleResize();};
    //if (this._container)
    //{
    //	window.addEventListener("resize", this._doResize, false);
    //}
};
BasicScene.prototype.installTrackballControls = function () {
    if (this._controls === null) {
        this._dirty = true;
        this._controls = new TrackballControls(this._camera, this._container);
        this._controls.rotateSpeed = 1.0;
        this._controls.zoomSpeed = 1.2;
        this._controls.panSpeed = 1.0;
        this._controls.noZoom = false;
        this._controls.noPan = false;
        this._controls.staticMoving = true;
        this._controls.dynamicDampingFactor = 0.3;
        this._controls.keys = [65, 83, 68];
        if (this._container) {
            this._container.addEventListener('mousewheel', this._markDirty);
            this._container.addEventListener('mousemove', this._markDirty);
        }
    }
};
BasicScene.prototype.removeTrackballControls = function () {
    if (this._controls !== null) {
        this._dirty = true;
        if (this._container) {
            this._container.removeEventListener('mousewheel', this._markDirty);
            this._container.removeEventListener('mousemove', this._markDirty);
        }
        this._controls.dispose();
        this._controls = null;
    }
};
BasicScene.prototype.installStats = function () {
    this._dirty = true;
    this._stats = new Stats();
    this._stats.domElement.style.position = "absolute";
    this._stats.domElement.style.top = "0px";
    this._stats.domElement.style.zIndex = 100;
    if (this._container) {
        this._container.appendChild(this._stats.domElement);
    }
};
/**
 * Set to true to only render this scene once every time markDirty has been called
 * @param {boolean} renderOnlyWhenDirty
 */
BasicScene.prototype.setRenderOnlyWhenDirty = function (renderOnlyWhenDirty) {
    this._renderOnlyWhenDirty = renderOnlyWhenDirty;
};
/**
 * @param {number} renderEveryNFrames - render at most once every n frames (1 means render every time)
 */
BasicScene.prototype.setRenderEveryNFrames = function (n) {
    this._renderEveryNFRames = n;
};
/**
 * Mark the scene as needing a re-render (only relevant if renderOnlyWhenDirty has been set)
 */
BasicScene.prototype.markDirty = function () {
    this._dirty = true;
};
/**
 * @return {boolean} true if did resize
 */
BasicScene.prototype.handleResize = function () {
    if (!this._container) {
        return false;
    }
    var box = this._container.getBoundingClientRect();
    if (box.width !== this._width || box.height !== this._height) {
        this._width = box.width;
        this._height = box.height;
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height);
        if (this._controls !== null) {
            this._controls.handleResize();
        }
        return true;
    }
    else {
        return false;
    }
};
BasicScene.prototype.detachFromContainer = function () {
    this.stop();
    if (this._container) {
        this._container.removeChild(this._renderer.domElement);
        //window.removeEventListener("resize", this._doResize, false);
        if (this._controls) {
            this._controls.detachFromContainer();
            this._container.removeEventListener('mousewheel', this._markDirty);
            this._container.removeEventListener('mousemove', this._markDirty);
        }
        if (this._stats) {
            this._container.removeChild(this._stats.domElement);
        }
        this._container = null;
    }
};
/**
 * @param {HTMLElement} element
 */
BasicScene.prototype.attachToContainer = function (element) {
    this._dirty = true;
    if (this._container) {
        this.detachFromContainer();
    }
    this._container = (element !== undefined) ? element : null;
    if (this._container) {
        var box = this._container.getBoundingClientRect();
        this._width = box.width;
        this._height = box.height;
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._width, this._height);
        this._renderer.domElement = document.adoptNode(this._renderer.domElement);
        this._container.appendChild(this._renderer.domElement);
        if (this._workaroundElementReadyRace) {
            var self = this;
            setInterval(function () { self.markDirty(); }, 200);
        }
        if (this._controls) {
            this._controls.attachToContainer(this._container);
            this._container.addEventListener('mousewheel', this._markDirty);
            this._container.addEventListener('mousemove', this._markDirty);
        }
        if (this._stats) {
            this._stats.domElement = document.adoptNode(this._stats.domElement);
            this._container.appendChild(this._stats.domElement);
        }
        //window.addEventListener("resize", this._doResize, false);
    }
};
BasicScene.prototype.dispose = function () {
    this.detachFromContainer();
    this.removeTrackballControls();
    this._camera = null;
    this._scene = null;
    this._ambientLight = null;
    this._directionalLight = null;
    this._renderer = null;
    this._renderCallbacks = null;
    this._postRenderCallbacks = null;
    this._controls = null;
    this._stats = null;
};
/**
 * @return {HTMLElement}
 */
BasicScene.prototype.getContainer = function () {
    return this._container;
};
/**
 * @return {THREE.PerspectiveCamera}
 */
BasicScene.prototype.getCamera = function () {
    return this._camera;
};
/**
 * @return {THREE.Scene}
 */
BasicScene.prototype.getScene = function () {
    return this._scene;
};
/**
 * @return {THREE.AmbientLight}
 */
BasicScene.prototype.getAmbientLight = function () {
    return this._ambientLight;
};
/**
 * @return {THREE.DirectionalLight}
 */
BasicScene.prototype.getDirectionalLight = function () {
    return this._directionalLight;
};
/**
 * @return {THREE.WebGLRenderer}
 */
BasicScene.prototype.getRenderer = function () {
    return this._renderer;
};
/**
 * @return {TrackballControls}
 */
BasicScene.prototype.getTrackballControls = function () {
    return this._controls;
};
/**
 * @return {Stats}
 */
BasicScene.prototype.getStats = function () {
    return this._stats;
};
BasicScene.prototype.addRenderCallback = function (cb) {
    this._dirty = true;
    this._renderCallbacks.push(cb);
};
BasicScene.prototype.removeRenderCallback = function (cb) {
    this._dirty = true;
    var cbIndex = this._renderCallbacks.indexOf(cb);
    if (cbIndex > -1) {
        this._renderCallbacks.splice(cbIndex, 1);
    }
};
BasicScene.prototype.addPostRenderCallback = function (cb) {
    this._dirty = true;
    this._postRenderCallbacks.push(cb);
};
BasicScene.prototype.removePostRenderCallback = function (cb) {
    this._dirty = true;
    var cbIndex = this._postRenderCallbacks.indexOf(cb);
    if (cbIndex > -1) {
        this._postRenderCallbacks.splice(cbIndex, 1);
    }
};
BasicScene.prototype.render = function () {
    // check for resize and update if necessary
    var didResize = this.handleResize();
    this._frameSkipCounter++;
    if ((this._frameSkipCounter >= this._renderEveryNFRames) &&
        (!this._renderOnlyWhenDirty || didResize || this._dirty)) {
        if (this._controls !== null) {
            this._controls.update();
        }
        for (var i = 0; i < this._renderCallbacks.length; i++) {
            this._renderCallbacks[i]();
        }
        this._renderer.render(this._scene, this._camera);
        for (i = 0; i < this._postRenderCallbacks.length; i++) {
            this._postRenderCallbacks[i]();
        }
        if (this._stats !== null) {
            this._stats.update();
        }
        this._dirty = false;
        this._frameSkipCounter = 0;
    }
};
BasicScene.prototype.play = function () {
    this._requestHandle = window.requestAnimationFrame(this._doPlay);
    this.render();
};
BasicScene.prototype.stop = function () {
    if (this._requestHandle !== undefined) {
        window.cancelAnimationFrame(this._requestHandle);
    }
};
module.exports = BasicScene;

},{"./TrackballControls":136,"@jibo/three":undefined,"stats-js":undefined}],129:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
/**
 *
 * @param {THREE.Vector3} pos1
 * @param {THREE.Vector3} pos2
 * @param {THREE.Color} color
 * @constructor
 */
var GLLinePoolLine = function (pos1, pos2, color) {
    this.pos1 = pos1;
    this.pos2 = pos2;
    this.color = color;
};
/**
 * @param {THREE.Vector3} pos1
 * @param {THREE.Vector3} pos2
 */
GLLinePoolLine.prototype.setPosition = function (pos1, pos2) {
    this.pos1 = pos1;
    this.pos2 = pos2;
};
/**
 * @param {THREE.Color} color
 */
GLLinePoolLine.prototype.setColor = function (color) {
    this.color = color;
};
/**
 * @param {BasicScene} renderInScene pool will be added to this scene if provided (optional)
 * @param {number} useMaxLines that can be rendered per update.  default 100 if omitted or null
 * @constructor
 */
var GLLinePool = function (renderInScene, useMaxLines) {
    if (useMaxLines === undefined || useMaxLines === null) {
        useMaxLines = 100;
    }
    /**	@type {number} */
    this.maxLines = useMaxLines;
    /**	@type {number} */
    this.numTempLines = 0;
    /**	@type {THREE.Vector3} */
    this.unusedVec = new THREE.Vector3(1000000, 1000000, 1000000);
    /**	@type {THREE.Color} */
    this.unusedColor = new THREE.Color(1, 1, 1);
    /** @type {THREE.LineBasicMaterial} */
    this.lineMaterial = new THREE.LineBasicMaterial({
        //	color: 0xff66ff
        vertexColors: THREE.VertexColors
    });
    /**	@type {THREE.Geometry} */
    this.lineGeometry = new THREE.Geometry();
    for (var i = 0; i < this.maxLines; i++) {
        this.lineGeometry.vertices.push(new THREE.Vector3().copy(this.unusedVec));
        this.lineGeometry.vertices.push(new THREE.Vector3().copy(this.unusedVec));
        this.lineGeometry.colors.push(new THREE.Color().copy(this.unusedColor));
        this.lineGeometry.colors.push(new THREE.Color().copy(this.unusedColor));
    }
    /**	@type {THREE.Line} */
    this.line = new THREE.Line(this.lineGeometry, this.lineMaterial, THREE.LinePieces);
    //Bounding sphere is computed once only for frustum culling
    //could also force recompute by this.lineGeometry.boundingSphere = null;
    this.line.frustumCulled = false;
    this.lineMaterial.linewidth = 1;
    this.postRenderCallbackInstalled = null;
    this.renderCallbackInstalled = null;
    /** @type {BasicScene} */
    this.addedToScene = null;
    /**
     * @type {GLLinePoolLine[]}
     */
    this.leasedLines = [];
    if (renderInScene !== undefined) {
        this.addToScene(renderInScene);
    }
};
/**
 *
 * @param {BasicScene} renderInScene
 */
GLLinePool.prototype.addToScene = function (renderInScene) {
    renderInScene.getScene().add(this.line);
    //cache the callback so we can remove it.
    this.postRenderCallbackInstalled = this.postRenderCleanup.bind(this);
    this.renderCallbackInstalled = this.prepareForRender.bind(this);
    this.addedToScene = renderInScene;
    renderInScene.addPostRenderCallback(this.postRenderCallbackInstalled);
    renderInScene.addRenderCallback(this.renderCallbackInstalled);
};
/**
 * Removes this GLLinePool from the scene it was added to.  Does nothing if
 * it has already been removed or was never added.
 */
GLLinePool.prototype.removeFromScene = function () {
    if (this.addedToScene != null) {
        this.addedToScene.getScene().remove(this.line);
        this.addedToScene.removePostRenderCallback(this.postRenderCallbackInstalled);
        this.addedToScene.removeRenderCallback(this.renderCallbackInstalled);
        this.addedToScene = null;
        this.postRenderCallbackInstalled = null;
    }
};
/**
 *
 * @param {THREE.Vector3} pos1
 * @param {THREE.Vector3} pos2
 * @param {THREE.Color} color
 */
GLLinePool.prototype.drawOnce = function (pos1, pos2, color) {
    if (this.numTempLines < this.maxLines) {
        this.lineGeometry.vertices[this.numTempLines * 2].copy(pos1);
        this.lineGeometry.vertices[this.numTempLines * 2 + 1].copy(pos2);
        this.lineGeometry.verticesNeedUpdate = true;
        if (color !== undefined) {
            this.lineGeometry.colors[this.numTempLines * 2].copy(color);
            this.lineGeometry.colors[this.numTempLines * 2 + 1].copy(color);
            this.lineGeometry.colorsNeedUpdate = true;
        }
        this.numTempLines++;
    }
};
/**
 * @param {THREE.Vector3} pos1
 * @param {THREE.Vector3} pos2
 * @param {THREE.Color} color
 * @return GLLinePoolLine
 */
GLLinePool.prototype.leaseLine = function (pos1, pos2, color) {
    var line = new GLLinePoolLine(pos1, pos2, color);
    this.leasedLines.push(line);
    return line;
};
/**
 * @param {GLLinePoolLine} leased
 */
GLLinePool.prototype.returnLeased = function (leased) {
    var index = this.leasedLines.indexOf(leased);
    if (index >= 0) {
        this.leasedLines.splice(index, 1);
    }
    else {
        console.log("Error, cannot return line that has not been leased!(" + leased + ")");
    }
};
GLLinePool.prototype.returnAllLeased = function () {
    this.leasedLines.length = 0;
};
/**
 *
 * @param {number} lineWidth set line width. default 1.
 * @return {GLLinePool} this for chaining
 */
GLLinePool.prototype.setLineWidth = function (lineWidth) {
    this.lineMaterial.linewidth = lineWidth;
    return this;
};
GLLinePool.prototype.prepareForRender = function () {
    for (var i = 0; i < this.leasedLines.length; i++) {
        var ll = this.leasedLines[i];
        this.drawOnce(ll.pos1, ll.pos2, ll.color);
    }
};
GLLinePool.prototype.postRenderCleanup = function () {
    if (this.numTempLines > 0) {
        for (var i = 0; i < this.numTempLines; i++) {
            this.lineGeometry.vertices[i * 2].copy(this.unusedVec);
            this.lineGeometry.vertices[i * 2 + 1].copy(this.unusedVec);
            this.lineGeometry.colors[i * 2].copy(this.unusedColor);
            this.lineGeometry.colors[i * 2 + 1].copy(this.unusedColor);
        }
        this.lineGeometry.verticesNeedUpdate = true;
        this.lineGeometry.colorsNeedUpdate = true;
        this.numTempLines = 0;
    }
};
module.exports = GLLinePool;

},{"@jibo/three":undefined}],130:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
/**
 * @param {BasicScene} renderInScene pool will be added to this scene if provided (optional)
 * @param {[number} limitMaxObjects that can be rendered per update.  unlimited if omitted.
 * @constructor
 */
var GLObjectPool = function (renderInScene) {
    /** @type {THREE.Object3D} */
    this.rootObject = new THREE.Object3D();
    /** @type {Array.<THREE.Object3D} */
    this.tempObjects = [];
    /** @type {Array.<THREE.Object3D} */
    this.leasedObjects = [];
    this.postRenderCallbackInstalled = null;
    this.renderCallbackInstalled = null;
    /** @type {BasicScene} */
    this.addedToScene = null;
    if (renderInScene !== undefined) {
        this.addToScene(renderInScene);
    }
};
/**
 *
 * @param {BasicScene} renderInScene
 */
GLObjectPool.prototype.addToScene = function (renderInScene) {
    renderInScene.getScene().add(this.rootObject);
    //cache the callback so we can remove it.
    this.postRenderCallbackInstalled = this.postRenderCleanup.bind(this);
    this.renderCallbackInstalled = this.prepareForRender.bind(this);
    this.addedToScene = renderInScene;
    renderInScene.addPostRenderCallback(this.postRenderCallbackInstalled);
    renderInScene.addRenderCallback(this.renderCallbackInstalled);
};
/**
 * Removes this GLObjectPool from the scene it was added to.  Does nothing if
 * it has already been removed or was never added.
 */
GLObjectPool.prototype.removeFromScene = function () {
    if (this.addedToScene != null) {
        this.addedToScene.getScene().remove(this.rootObject);
        this.addedToScene.removePostRenderCallback(this.postRenderCallbackInstalled);
        this.addedToScene.removeRenderCallback(this.renderCallbackInstalled);
        this.addedToScene = null;
        this.postRenderCallbackInstalled = null;
    }
};
/**
 *
 * @param {THREE.Object3D} object
 * @protected
 */
GLObjectPool.prototype.addToDrawOnce = function (object) {
    this.tempObjects.push(object);
    this.rootObject.add(object);
};
/**
 *
 * @param {THREE.Object3D} object
 * @protected
 */
GLObjectPool.prototype.addToLeased = function (object) {
    this.leasedObjects.push(object);
    this.rootObject.add(object);
};
/**
 *
 * @param {THREE.Object3D} object
 * @protected
 */
GLObjectPool.prototype.removeObject = function (object) {
    this.rootObject.remove(object);
};
/**
 * @param {THREE.Object3D} leasedObject
 */
GLObjectPool.prototype.returnLeased = function (leasedObject) {
    var index = this.leasedObjects.indexOf(leasedObject);
    if (index >= 0) {
        this.leasedObjects.splice(index, 1);
        this.removeObject(leasedObject);
    }
    else {
        console.log("Error, cannot return object that has not been leased!(" + leasedObject + ")");
    }
};
GLObjectPool.prototype.returnAllLeased = function () {
    for (var i = 0; i < this.leasedObjects.length; i++) {
        this.removeObject(this.leasedObjects[i]);
    }
    this.leasedObjects.length = 0;
};
GLObjectPool.prototype.prepareForRender = function () {
};
GLObjectPool.prototype.postRenderCleanup = function () {
    for (var i = 0; i < this.tempObjects.length; i++) {
        this.removeObject(this.tempObjects[i]);
    }
    this.tempObjects.length = 0;
};
GLObjectPool.prototype.dispose = function () {
    this.removeFromScene();
    this.returnAllLeased();
    this.postRenderCleanup();
};
module.exports = GLObjectPool;

},{"@jibo/three":undefined}],131:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var GLObjectPool = require("./GLObjectPool");
/**
 * @param {BasicScene} renderInScene - pool will be added to this scene if provided (optional)
 * @param {number} [limitMaxObjects] - max that can be rendered per update.  unlimited if omitted.
 * @param {boolean} [cacheUnused] - true to cache the unrendered spheres, false to release them
 * @extends GLObjectPool
 * @constructor
 */
var GLSpherePool = function (renderInScene, limitMaxObjects, cacheUnused) {
    GLObjectPool.call(this, renderInScene);
    this.cacheUnused = true;
    if (cacheUnused != null) {
        this.cacheUnused = cacheUnused;
    }
    /** @type {boolean} */
    this.doLimit = false;
    /** @type {number} */
    this.limit = 0;
    if (limitMaxObjects != null) {
        this.doLimit = true;
        this.limit = limitMaxObjects;
    }
    /** @type {THREE.SphereGeometry} */
    this.sphereGeometry = new THREE.SphereGeometry(1, 20, 12);
    /** @type {Array.<THREE.Mesh>} */
    this.unusedSpheres = [];
    /** @type {THREE.Color} */
    this.defaultColor = new THREE.Color(1, 1, 1);
};
GLSpherePool.prototype = Object.create(GLObjectPool.prototype);
GLSpherePool.prototype.constructor = GLSpherePool;
/**
 * Internal helper to provide sphere (new or from cache)
 * @param {THREE.Vector3} pos
 * @param {number} size
 * @param {THREE.Color} [color]
 * @return {THREE.Mesh}
 * @protected
 */
GLSpherePool.prototype.provideSphere = function (pos, size, color) {
    if (!this.doLimit || this.tempObjects.length + this.leasedObjects.length < this.limit) {
        var c = color;
        if (color == null) {
            c = this.defaultColor;
        }
        var s;
        if (this.unusedSpheres.length > 0) {
            s = this.unusedSpheres.pop();
            s.material.color.copy(c);
        }
        else {
            let material = new THREE.MeshLambertMaterial({ color: c });
            s = new THREE.Mesh(this.sphereGeometry, material);
        }
        s.scale.set(size, size, size);
        s.position.copy(pos);
        return s;
    }
    else {
        return null;
    }
};
/**
 *
 * @param {THREE.Vector3} pos
 * @param {number} size
 * @param {THREE.Color} [color]
 */
GLSpherePool.prototype.drawOnce = function (pos, size, color) {
    var s = this.provideSphere(pos, size, color);
    if (s !== null) {
        this.addToDrawOnce(s);
    }
};
/**
 *
 * @param {THREE.Vector3} pos
 * @param {number} size
 * @param {THREE.Color} [color]
 */
GLSpherePool.prototype.leaseSphere = function (pos, size, color) {
    var s = this.provideSphere(pos, size, color);
    if (s !== null) {
        this.addToLeased(s);
    }
};
/**
 *
 * @param {THREE.Object3D} object
 * @override
 * @protected
 */
GLSpherePool.prototype.removeObject = function (object) {
    GLObjectPool.prototype.removeObject.call(this, object);
    if (this.cacheUnused) {
        this.unusedSpheres.push(object);
    }
    else {
        object.material.dispose();
        //don't dispose the shared geometry
    }
};
GLSpherePool.prototype.dispose = function () {
    GLObjectPool.prototype.dispose.call(this); //this will move them all to unused if cacheUnused is on.
    for (var i = 0; i < this.unusedSpheres.length; i++) {
        this.unusedSpheres[i].material.dispose();
    }
    this.unusedSpheres.length = 0;
    this.sphereGeometry.dispose();
    this.sphereGeometry = null;
};
module.exports = GLSpherePool;

},{"./GLObjectPool":130,"@jibo/three":undefined}],132:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
var TextOverlay = require("./TextOverlayPool");
var MouseCoordinateWrangler = require("./MouseCoordinateWrangler");
/**
 * @param {BasicScene} renderInScene
 * @constructor
 */
var GLTextOverlayPool = function (renderInScene) {
    this.textOverlay = new TextOverlay(renderInScene.getContainer());
    /**
     * @type {HTMLElement}
     */
    this.container = renderInScene.getContainer();
    /**
     * @type {THREE.Camera}
     */
    this.camera = renderInScene.getCamera();
    /** @type {BasicScene} */
    this.addedToScene = null;
    this.postRenderCallbackInstalled = null;
    //TODO: textOverlay doesn't support adding/removing from container, so we will attach exactly once for now
    this._addToScene(renderInScene);
};
/**
 * @param {BasicScene} renderInScene
 * @private
 */
GLTextOverlayPool.prototype._addToScene = function (renderInScene) {
    //cache the callback so we can remove it.
    this.postRenderCallbackInstalled = this.postRenderCleanup.bind(this);
    this.addedToScene = renderInScene;
    renderInScene.addPostRenderCallback(this.postRenderCallbackInstalled);
};
/**
 * Removes this GLTextOverlayPool from the scene it was added to.  Does nothing if
 * it has already been removed or was never added.
 */
GLTextOverlayPool.prototype.removeFromScene = function () {
    if (this.addedToScene != null) {
        this.addedToScene.removePostRenderCallback(this.postRenderCallbackInstalled);
        this.addedToScene = null;
        this.postRenderCallbackInstalled = null;
    }
    this.textOverlay.postRenderCleanup();
    this.textOverlay.returnAllLeased();
};
/**
 *
 * @param {string} text
 * @param {number} pixelX
 * @param {number} pixelY
 * @param {?string} [color]
 * @param {?number} [size]
 */
GLTextOverlayPool.prototype.drawOnce2D = function (text, pixelX, pixelY, color, size) {
    this.textOverlay.drawOnce2D(text, pixelX, pixelY, color, size);
};
/**
 *
 * @param {string} text
 * @param {number} worldX
 * @param {number} worldY
 * @param {number} worldZ
 * @param {?string} [color]
 * @param {?number} [size]
 */
GLTextOverlayPool.prototype.drawOnce3D = function (text, worldX, worldY, worldZ, color, size) {
    var p2d = MouseCoordinateWrangler.projectToScreenPixels(worldX, worldY, worldZ, this.camera, this.container, true);
    if (p2d !== null) {
        this.textOverlay.drawOnce2D(text, p2d.x, p2d.y, color, size);
    }
};
/**
 *
 * @param {string} text
 * @param {number} pixelX
 * @param {number} pixelY
 * @param {?string} [color]
 * @param {?number} [size]
 * @return {TextElement}
 */
GLTextOverlayPool.prototype.lease2D = function (text, pixelX, pixelY, color, size) {
    return this.textOverlay.lease2D(text, pixelX, pixelY, color, size);
};
/**
 *
 * @param {string} text
 * @param {number} worldX
 * @param {number} worldY
 * @param {number} worldZ
 * @param {?string} [color]
 * @param {?number} [size]
 * @return {TextElement}
 */
GLTextOverlayPool.prototype.lease3D = function (text, worldX, worldY, worldZ, color, size) {
    var p2d = MouseCoordinateWrangler.projectToScreenPixels(worldX, worldY, worldZ, this.camera, this.container, true);
    if (p2d !== null) {
        this.textOverlay.lease2D(text, p2d.x, p2d.y, color, size);
    }
    else {
        this.textOverlay.lease2D(text, -1000, -1000, color, size); //make it offscreen in case it is to be fixed later
    }
};
/**
 * @param {TextElement} element
 */
GLTextOverlayPool.prototype.returnLeased = function (element) {
    this.textOverlay.returnLeased(element);
};
GLTextOverlayPool.prototype.returnAllLeased = function () {
    this.textOverlay.returnAllLeased();
};
GLTextOverlayPool.prototype.postRenderCleanup = function () {
    this.textOverlay.postRenderCleanup();
};
module.exports = GLTextOverlayPool;

},{"./MouseCoordinateWrangler":133,"./TextOverlayPool":135}],133:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var slog = require("../ifr-core/SLog");
var channel = "MOUSE_COORD_WRANGLER";
var MouseCoordinateWrangler = {};
/**
 * Get the offset rect of an element on the page. Rect will be relative to page top left, scroll-invariant
 * @param {Element} elem
 * @returns {{top: number, left: number, width: number, height: number}} rect of elem on entire page in pixels, from top-left, scroll-invariant
 */
MouseCoordinateWrangler.getOffsetRect = function (elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return { top: Math.round(top), left: Math.round(left), width: Math.round(box.width), height: Math.round(box.height) };
};
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {THREE.Camera} camera
 * @returns {{x:number, y:number}} ndc 2D (-1 to 1) location for this 3d location
 */
MouseCoordinateWrangler.projectToScreenNDC = function (x, y, z, camera) {
    var projected = new THREE.Vector3(x, y, z).project(camera);
    return { x: projected.x, y: projected.y };
};
/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {THREE.Camera} camera
 * @param {Element} container
 * @param {boolean} [dropOutOfBounds] = false
 * @returns {?{x:number, y:number}} pixel location for this 3d location
 */
MouseCoordinateWrangler.projectToScreenPixels = function (x, y, z, camera, container, dropOutOfBounds) {
    var projected = new THREE.Vector3(x, y, z).project(camera);
    if (projected.z < 0 || projected.z > 1) {
        //console.log("Clipping:"+projected.z);
        return null;
    }
    if (dropOutOfBounds === true && (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1)) {
        return null;
    }
    var rect = container.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    return { x: projected.x * width / 2 + width / 2, y: -projected.y * height / 2 + height / 2 };
};
/**
 *
 * @param {UIEvent} event
 * @param {Element} element
 * @returns {{x: number, y: number}} pixel location of the event relative to the top left of the element
 */
MouseCoordinateWrangler.getLocalCoordinates = function (event, element) {
    var bounds = MouseCoordinateWrangler.getOffsetRect(element);
    return { x: event.pageX - bounds.left, y: event.pageY - bounds.top };
};
/**
 *
 * @param {UIEvent} event
 * @param {Element} element
 * @returns {{x: number, y: number}} NDC location of the event relative to the bottom left of the element (0-1 from bottom left)
 */
MouseCoordinateWrangler.getLocalCoordinatesNDC = function (event, element) {
    var bounds = MouseCoordinateWrangler.getOffsetRect(element);
    return { x: (event.pageX - bounds.left) / bounds.width, y: 1 - (event.pageY - bounds.top) / bounds.height };
};
/**
 *
 * @param {UIEvent} event
 * @param {Element} element
 * @returns {{x: number, y: number}} NDC location of the event relative to the center of the element (-1 to 1, cartesian)
 */
MouseCoordinateWrangler.getLocalCoordinatesNDCCentered = function (event, element) {
    var bounds = MouseCoordinateWrangler.getOffsetRect(element);
    return { x: ((event.pageX - bounds.left) / bounds.width) * 2 - 1, y: (1 - (event.pageY - bounds.top) / bounds.height) * 2 - 1 };
};
/**
 *
 * @param {number} ndcCenteredScreenX - screen location x in centered NDC (-1 to 1)
 * @param {number} ndcCenteredScreenY - screen location y in centered NDC (-1 to 1)
 * @param {THREE.PerspectiveCamera} camera - camera that is projecting this scene
 * @param {THREE.Vector3} pointOnPlane - any point on the target plane, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} planeNormal - normal of the target plane, (0,1,0) will be used if omitted
 * @returns {THREE.Vector3} the point where the screen point intersects the given plane, or undefined if it doesn't intersect
 */
MouseCoordinateWrangler.unprojectScreenToPlane = function (ndcCenteredScreenX, ndcCenteredScreenY, camera, pointOnPlane, planeNormal) {
    var screenVecNear = new THREE.Vector3(ndcCenteredScreenX, ndcCenteredScreenY, 0);
    var screenVecFar = new THREE.Vector3(ndcCenteredScreenX, ndcCenteredScreenY, 1);
    screenVecNear.unproject(camera);
    screenVecFar.unproject(camera);
    var lineDirection = screenVecFar.sub(screenVecNear);
    var lineAnchor = screenVecNear;
    lineDirection.normalize();
    var lineAnchorToPlaneAnchor = new THREE.Vector3().copy(pointOnPlane).sub(lineAnchor);
    var denominator = lineDirection.dot(planeNormal);
    if (Math.abs(denominator) < 0.0001) {
        slog(channel, "un-project error, no intersection");
        return undefined;
    }
    else {
        var dist = lineAnchorToPlaneAnchor.dot(planeNormal) / lineDirection.dot(planeNormal);
        if (dist < 0) {
            slog(channel, "error, intersection behind camera");
            return undefined;
        }
        else {
            return lineAnchor.add(lineDirection.multiplyScalar(dist));
        }
    }
};
/**
 *
 * @param {UIEvent} event - event to project the location of
 * @param {Element} element - the gl element
 * @param {THREE.PerspectiveCamera} camera - camera that is projecting this scene
 * @param {THREE.Vector3} pointOnPlane - any point on the target plane, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} planeNormal - normal of the target plane, (0,1,0) will be used if omitted
 * @returns {THREE.Vector3} the point where the screen point intersects the given plane, or undefined if it doesn't intersect
 */
MouseCoordinateWrangler.unprojectEventToPlane = function (event, element, camera, pointOnPlane, planeNormal) {
    var local = MouseCoordinateWrangler.getLocalCoordinatesNDCCentered(event, element);
    if (pointOnPlane === undefined) {
        pointOnPlane = new THREE.Vector3(0, 0, 0);
    }
    if (planeNormal === undefined) {
        planeNormal = new THREE.Vector3(0, 1, 0);
    }
    return MouseCoordinateWrangler.unprojectScreenToPlane(local.x, local.y, camera, pointOnPlane, planeNormal);
};
module.exports = MouseCoordinateWrangler;

},{"../ifr-core/SLog":57,"@jibo/three":undefined}],134:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var MouseCoordinateWrangler = require("./MouseCoordinateWrangler");
var ViewportTargetPositioner = require("./ViewportTargetPositioner");
var slog = require("../ifr-core/SLog");
var channel = "UI_TARGET";
/**
 * @callback MouseEventSelectionFilter
 * @param {MouseEvent}
 * @return {boolean}
 * @intdocs
 */
/**
 *
 * @param {Element} element - the gl element
 * @param {THREE.PerspectiveCamera} camera - camera that is projecting this scene
 * @param {THREE.Vector3} defaultInitialPosition - initial position, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} pointOnGroundPlane - any point on the ground plane, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} groundPlaneNormal - normal of the ground plane, (0,1,0) will be used if omitted
 * @param {string[]} [initialTargetNames] - names of initial target positioners.  defaults to ["default"].  pass [] to start with no positioners.
 * @constructor
 */
var MouseTargetPositioner = function (element, camera, defaultInitialPosition, pointOnGroundPlane, groundPlaneNormal, initialTargetNames) {
    if (defaultInitialPosition == null) {
        defaultInitialPosition = new THREE.Vector3(0, 0, 0);
    }
    if (pointOnGroundPlane == null) {
        pointOnGroundPlane = new THREE.Vector3(0, 0, 0);
    }
    if (groundPlaneNormal == null) {
        groundPlaneNormal = new THREE.Vector3(0, 1, 0);
    }
    if (initialTargetNames == null) {
        initialTargetNames = ["default"];
    }
    /** positionChangedCallback[] */
    var positionChangedListeners = [];
    /** @type{Map<string,ViewportTargetPositioner>} */
    var targetPositioners = new Map();
    /** @type{string} */
    var selectedPositionerName = null;
    var capture = true;
    /** @type {MouseEventSelectionFilter} */
    var isForMe = null;
    /** @type {MouseEventSelectionFilter} */
    var isForGroundPlane = null;
    /** @type {MouseEventSelectionFilter} */
    var isForCameraPlane = null;
    /** @type {BasicScene} */
    var renderInScene = null;
    /**
     * @param {MouseEvent} event
     */
    var processEvent = function (event) {
        event.preventDefault();
        event.stopPropagation();
        var local = MouseCoordinateWrangler.getLocalCoordinatesNDCCentered(event, element);
        if (selectedPositionerName != null) {
            var currentVTP = targetPositioners.get(selectedPositionerName);
            if (currentVTP != null) {
                if (isForGroundPlane(event)) {
                    currentVTP.moveToNDCPoint(local.x, local.y, true);
                }
                else if (isForCameraPlane(event)) {
                    currentVTP.moveToNDCPoint(local.x, local.y, false);
                }
            }
        }
    };
    /**
     * @param {MouseEvent} event
     */
    var mouseMoved = function (event) {
        if (isForMe(event)) {
            processEvent(event);
        }
    };
    var acceptOutOfWindowMotions = true;
    /**
     * @param {MouseEvent} event
     */
    var mouseUp = function (event) {
        if (acceptOutOfWindowMotions) {
            document.removeEventListener("mousemove", mouseMoved, capture);
            document.removeEventListener("mouseup", mouseUp, capture);
        }
        else {
            element.removeEventListener("mousemove", mouseMoved, capture);
            element.removeEventListener("mouseup", mouseUp, capture);
            element.removeEventListener("mouseleave", mouseUp, capture);
        }
    };
    element.addEventListener('mousedown', function (event) {
        if (isForMe(event)) {
            processEvent(event);
            if (acceptOutOfWindowMotions) {
                document.addEventListener('mousemove', mouseMoved, capture);
                document.addEventListener('mouseup', mouseUp, capture);
            }
            else {
                element.addEventListener('mousemove', mouseMoved, capture);
                element.addEventListener('mouseup', mouseUp, capture);
                element.addEventListener('mouseleave', mouseUp, capture);
            }
        }
    }, capture);
    /**
     * Set mouse filters for this positioner.  The "isForMeFilter" is first applied, and only
     * events that match this filter will be processed at all.  "isForGroupPlane" and "isForCamera"
     * filters will only be run on events that already passed the "isForMeFilter".  "isForGroundPlane"
     * is evaluated first, points will not be used for camera plane if they match for ground plane.
     *
     * @param {MouseEventSelectionFilter} [isForMeFilter] - specify filter for this positioner (default is NONE of alt, meta, ctrl down)
     * @param {MouseEventSelectionFilter} [isForGroundPlaneFilter] - specify filter for ground plane clicks (default is shift down)
     * @param {MouseEventSelectionFilter} [isForCameraPlaneFilter] - specify filter for camera plane clicks (default is shift up)
     */
    this.setMouseFilters = function (isForMeFilter, isForGroundPlaneFilter, isForCameraPlaneFilter) {
        if (isForMeFilter != null) {
            isForMe = isForMeFilter;
        }
        else {
            isForMe = function (event) {
                return (!event.altKey && !event.metaKey && !event.ctrlKey);
            };
        }
        if (isForGroundPlaneFilter != null) {
            isForGroundPlane = isForGroundPlaneFilter;
        }
        else {
            isForGroundPlane = function (event) {
                return event.shiftKey;
            };
        }
        if (isForCameraPlaneFilter != null) {
            isForCameraPlane = isForCameraPlaneFilter;
        }
        else {
            isForCameraPlane = function (event) {
                return !event.shiftKey;
            };
        }
    };
    /**
     * @param {positionChangedCallback} cb
     */
    this.addPositionChangedCallback = function (cb) {
        var cbIndex = positionChangedListeners.indexOf(cb);
        if (cbIndex < 0) {
            positionChangedListeners.push(cb);
        }
    };
    /**
     * @param {positionChangedCallback} cb
     */
    this.removePositionChangedCallback = function (cb) {
        var cbIndex = positionChangedListeners.indexOf(cb);
        if (cbIndex > -1) {
            positionChangedListeners.splice(cbIndex, 1);
        }
    };
    /**
     * @param {THREE.Vector3} position
     * @param {string} name
     */
    this.notifyPositionChangedCallbacks = function (position, name) {
        for (var i = 0; i < positionChangedListeners.length; i++) {
            positionChangedListeners[i](position, name);
        }
    };
    /**
     * @param {string} name
         * @param {THREE.Vector3} [initialPosition] defaults to value passed to MouseTargetPositioner constructor.
     */
    this.addTargetPositioner = function (name, initialPosition) {
        if (!targetPositioners.has(name)) {
            if (initialPosition == null) {
                initialPosition = defaultInitialPosition;
            }
            var vtp = new ViewportTargetPositioner(name, camera, initialPosition, pointOnGroundPlane, groundPlaneNormal);
            vtp.addPositionChangedCallback(this.notifyPositionChangedCallbacks);
            if (renderInScene !== null) {
                vtp.installRendererIntoScene(renderInScene);
            }
            targetPositioners.set(name, vtp);
            if (selectedPositionerName === null) {
                selectedPositionerName = name;
                vtp.setHighlighted(true);
            }
            else {
                vtp.setHighlighted(false);
            }
        }
        else {
            slog(channel, "Not adding MouseTargetPositioner target " + name + ", already have target with that name");
        }
    };
    this.removeTargetPositioner = function (name) {
        if (targetPositioners.has(name)) {
            var vtp = targetPositioners.get(name);
            if (renderInScene !== null) {
                vtp.removeRendererFromScene(renderInScene);
            }
            vtp.removePositionChangedCallback(this.notifyPositionChangedCallbacks);
            targetPositioners.delete(name);
            if (selectedPositionerName === name) {
                selectedPositionerName = null;
            }
        }
    };
    this.getTargetPositionerNames = function () {
        var names = [];
        var nameIter = targetPositioners.keys();
        var nextName;
        while (!(nextName = nameIter.next()).done) {
            names.push(nextName.value);
        }
        return names;
    };
    /**
     * @param {?string} name - name of target to select, null to deselect all
     */
    this.selectTarget = function (name) {
        if (selectedPositionerName != null) {
            var currentlySelected = targetPositioners.get(selectedPositionerName);
            if (currentlySelected != null) {
                currentlySelected.setHighlighted(false);
            }
        }
        if (name != null) {
            var newlySelected = targetPositioners.get(name);
            if (newlySelected != null) {
                newlySelected.setHighlighted(true);
            }
        }
        selectedPositionerName = name;
    };
    this.installRendererIntoScene = function (scene) {
        if (renderInScene !== null) {
            throw new Error("Remove MTP renderer from existing scene before installing in another!");
        }
        for (var vtp of targetPositioners.values()) {
            vtp.installRendererIntoScene(scene);
        }
        renderInScene = scene;
    };
    this.removeRendererFromScene = function (scene) {
        for (var vtp of targetPositioners.values()) {
            vtp.removeRendererFromScene(scene);
        }
        renderInScene = null;
    };
    //set to default
    this.setMouseFilters();
    for (var installName of initialTargetNames) {
        this.addTargetPositioner(installName);
    }
};
module.exports = MouseTargetPositioner;

},{"../ifr-core/SLog":57,"./MouseCoordinateWrangler":133,"./ViewportTargetPositioner":137,"@jibo/three":undefined}],135:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2016 IF Robots LLC
 */
"use strict";
/**
 * @type {number}
 */
var idCounter = 0;
/**
 *
 * @param {?string} [text]
 * @param {?string} [colorString]
 * @param {?number} [fontSize]
 * @constructor
 */
var TextElement = function (text, colorString, fontSize) {
    this.div = document.createElement('div');
    this.div.id = 'text-display:' + (idCounter++);
    this.div.style.cssText = 'padding:0 0 0px 0px;text-align:left;position:absolute';
    if (colorString != null) {
        this.setColor(colorString);
    }
    if (fontSize != null) {
        this.setSize(fontSize);
    }
    if (text != null) {
        this.setText(text);
    }
};
/**
 * @param {number} x
 * @param {number} y
 */
TextElement.prototype.setPosition2D = function (x, y) {
    this.div.style.top = y + "px";
    this.div.style.left = x + "px";
};
/**
 * @param {string} colorString
 */
TextElement.prototype.setColor = function (colorString) {
    this.div.style.color = colorString;
};
/**
 * @param {string} text
 */
TextElement.prototype.setText = function (text) {
    this.div.innerHTML = text;
};
/**
 * @param {number} fontSize
 */
TextElement.prototype.setSize = function (fontSize) {
    this.div.style.fontSize = fontSize;
};
/**
 *
 * @param {Element} onElement
 * @constructor
 */
var TextOverlayPool = function (onElement) {
    /**
     * @type {Element}
     */
    this.onElement = onElement;
    /**
     * @type {TextElement[]}
     */
    this.drawOnceElements = [];
    /**
     * @type {TextElement[]}
     */
    this.leasedElements = [];
};
/**
 *
 * @param {string} text
 * @param {number} pixelX
 * @param {number} pixelY
 * @param {?string} [color]
 * @param {?number} [size]
 */
TextOverlayPool.prototype.drawOnce2D = function (text, pixelX, pixelY, color, size) {
    var te = new TextElement(text, color, size);
    te.setPosition2D(pixelX, pixelY);
    this.drawOnceElements.push(te);
    this.onElement.appendChild(te.div);
};
/**
 *
 * @param {string} text
 * @param {number} pixelX
 * @param {number} pixelY
 * @param {?string} [color]
 * @param {?number} [size]
 * @return {TextElement}
 */
TextOverlayPool.prototype.lease2D = function (text, pixelX, pixelY, color, size) {
    var te = new TextElement(text, color, size);
    te.setPosition2D(pixelX, pixelY);
    this.leasedElements.push(te);
    this.onElement.appendChild(te.div);
    return te;
};
/**
 * @param {TextElement} element
 */
TextOverlayPool.prototype.returnLeased = function (element) {
    var matchingIndex = this.leasedElements.indexOf(element);
    if (matchingIndex >= 0) {
        this.onElement.removeChild(element.div);
        this.leasedElements.splice(matchingIndex, 1);
    }
    else {
        console.log("Error, cannot return leased text element that is not been leased!(" + (element == null ? "null" : element.div.innerHTML) + ")");
    }
};
TextOverlayPool.prototype.returnAllLeased = function () {
    while (this.leasedElements.length > 0) {
        var te = this.leasedElements.pop();
        this.onElement.removeChild(te.div);
    }
};
TextOverlayPool.prototype.postRenderCleanup = function () {
    while (this.drawOnceElements.length > 0) {
        var te = this.drawOnceElements.pop();
        this.onElement.removeChild(te.div);
    }
};
module.exports = TextOverlayPool;

},{}],136:[function(require,module,exports){
/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 */
// adapted directly from three.js examples
"use strict";
var THREE = require("@jibo/three");
var TrackballControls = function (object, domElement) {
    var _this = this;
    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
    this.object = object;
    this.domElement = null;
    // API
    this.enabled = false;
    this.screen = { left: 0, top: 0, width: 0, height: 0 };
    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;
    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;
    this.noRoll = false;
    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.keys = [65 /*A*/, 83 /*S*/, 68 /*D*/];
    // internals
    this.target = new THREE.Vector3();
    var EPS = 0.000001;
    var lastPosition = new THREE.Vector3();
    var _state = STATE.NONE, _prevState = STATE.NONE, _eye = new THREE.Vector3(), _rotateStart = new THREE.Vector3(), _rotateEnd = new THREE.Vector3(), _zoomStart = new THREE.Vector2(), _zoomEnd = new THREE.Vector2(), _touchZoomDistanceStart = 0, _touchZoomDistanceEnd = 0, _panStart = new THREE.Vector2(), _panEnd = new THREE.Vector2();
    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();
    // events
    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };
    // methods
    this.handleResize = function () {
        if (_this.enabled === false)
            return;
        if (this.domElement === document) {
            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;
        }
        else {
            var box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;
        }
    };
    this.handleEvent = function (event) {
        if (typeof this[event.type] == 'function') {
            this[event.type](event);
        }
    };
    var getMouseOnScreen = (function () {
        var vector = new THREE.Vector2();
        return function (pageX, pageY) {
            vector.set((pageX - _this.screen.left) / _this.screen.width, (pageY - _this.screen.top) / _this.screen.height);
            return vector;
        };
    }());
    var getMouseProjectionOnBall = (function () {
        var vector = new THREE.Vector3();
        var objectUp = new THREE.Vector3();
        var mouseOnBall = new THREE.Vector3();
        return function (pageX, pageY) {
            mouseOnBall.set((pageX - _this.screen.width * 0.5 - _this.screen.left) / (_this.screen.width * .5), (_this.screen.height * 0.5 + _this.screen.top - pageY) / (_this.screen.height * .5), 0.0);
            var length = mouseOnBall.length();
            if (_this.noRoll) {
                if (length < Math.SQRT1_2) {
                    mouseOnBall.z = Math.sqrt(1.0 - length * length);
                }
                else {
                    mouseOnBall.z = .5 / length;
                }
            }
            else if (length > 1.0) {
                mouseOnBall.normalize();
            }
            else {
                mouseOnBall.z = Math.sqrt(1.0 - length * length);
            }
            _eye.copy(_this.object.position).sub(_this.target);
            vector.copy(_this.object.up).setLength(mouseOnBall.y);
            vector.add(objectUp.copy(_this.object.up).cross(_eye).setLength(mouseOnBall.x));
            vector.add(_eye.setLength(mouseOnBall.z));
            return vector;
        };
    }());
    this.rotateCamera = (function () {
        var axis = new THREE.Vector3(), quaternion = new THREE.Quaternion();
        return function () {
            var angle = Math.acos(_rotateStart.dot(_rotateEnd) / _rotateStart.length() / _rotateEnd.length());
            if (angle) {
                axis.crossVectors(_rotateStart, _rotateEnd).normalize();
                angle *= _this.rotateSpeed;
                quaternion.setFromAxisAngle(axis, -angle);
                _eye.applyQuaternion(quaternion);
                _this.object.up.applyQuaternion(quaternion);
                _rotateEnd.applyQuaternion(quaternion);
                if (_this.staticMoving) {
                    _rotateStart.copy(_rotateEnd);
                }
                else {
                    quaternion.setFromAxisAngle(axis, angle * (_this.dynamicDampingFactor - 1.0));
                    _rotateStart.applyQuaternion(quaternion);
                }
            }
        };
    }());
    this.zoomCamera = function () {
        var factor;
        if (_state === STATE.TOUCH_ZOOM_PAN) {
            factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
            _touchZoomDistanceStart = _touchZoomDistanceEnd;
            _eye.multiplyScalar(factor);
        }
        else {
            factor = 1.0 + (_zoomEnd.y - _zoomStart.y) * _this.zoomSpeed;
            if (factor !== 1.0 && factor > 0.0) {
                _eye.multiplyScalar(factor);
                if (_this.staticMoving) {
                    _zoomStart.copy(_zoomEnd);
                }
                else {
                    _zoomStart.y += (_zoomEnd.y - _zoomStart.y) * this.dynamicDampingFactor;
                }
            }
        }
    };
    this.panCamera = (function () {
        var mouseChange = new THREE.Vector2(), objectUp = new THREE.Vector3(), pan = new THREE.Vector3();
        return function () {
            mouseChange.copy(_panEnd).sub(_panStart);
            if (mouseChange.lengthSq()) {
                mouseChange.multiplyScalar(_eye.length() * _this.panSpeed);
                pan.copy(_eye).cross(_this.object.up).setLength(mouseChange.x);
                pan.add(objectUp.copy(_this.object.up).setLength(mouseChange.y));
                _this.object.position.add(pan);
                _this.target.add(pan);
                if (_this.staticMoving) {
                    _panStart.copy(_panEnd);
                }
                else {
                    _panStart.add(mouseChange.subVectors(_panEnd, _panStart).multiplyScalar(_this.dynamicDampingFactor));
                }
            }
        };
    }());
    this.checkDistances = function () {
        if (!_this.noZoom || !_this.noPan) {
            if (_eye.lengthSq() > _this.maxDistance * _this.maxDistance) {
                _this.object.position.addVectors(_this.target, _eye.setLength(_this.maxDistance));
            }
            if (_eye.lengthSq() < _this.minDistance * _this.minDistance) {
                _this.object.position.addVectors(_this.target, _eye.setLength(_this.minDistance));
            }
        }
    };
    this.update = function () {
        _eye.subVectors(_this.object.position, _this.target);
        if (!_this.noRotate) {
            _this.rotateCamera();
        }
        if (!_this.noZoom) {
            _this.zoomCamera();
        }
        if (!_this.noPan) {
            _this.panCamera();
        }
        _this.object.position.addVectors(_this.target, _eye);
        _this.checkDistances();
        _this.object.lookAt(_this.target);
        if (lastPosition.distanceToSquared(_this.object.position) > EPS) {
            _this.dispatchEvent(changeEvent);
            lastPosition.copy(_this.object.position);
        }
    };
    this.reset = function () {
        _state = STATE.NONE;
        _prevState = STATE.NONE;
        _this.target.copy(_this.target0);
        _this.object.position.copy(_this.position0);
        _this.object.up.copy(_this.up0);
        _eye.subVectors(_this.object.position, _this.target);
        _this.object.lookAt(_this.target);
        _this.dispatchEvent(changeEvent);
        lastPosition.copy(_this.object.position);
    };
    // listeners
    function keydown(event) {
        if (_this.enabled === false)
            return;
        window.removeEventListener('keydown', keydown);
        _prevState = _state;
        if (_state !== STATE.NONE) {
            return;
        }
        else if (event.keyCode === _this.keys[STATE.ROTATE] && !_this.noRotate) {
            _state = STATE.ROTATE;
        }
        else if (event.keyCode === _this.keys[STATE.ZOOM] && !_this.noZoom) {
            _state = STATE.ZOOM;
        }
        else if (event.keyCode === _this.keys[STATE.PAN] && !_this.noPan) {
            _state = STATE.PAN;
        }
    }
    function keyup(event) {
        if (_this.enabled === false)
            return;
        _state = _prevState;
        window.addEventListener('keydown', keydown, false);
    }
    function mousedown(event) {
        if (_this.enabled === false)
            return;
        event.preventDefault();
        event.stopPropagation();
        if (_state === STATE.NONE) {
            _state = event.button;
            if (event.button === 0 && event.shiftKey) {
                _state = STATE.PAN;
            }
        }
        if (_state === STATE.ROTATE && !_this.noRotate) {
            _rotateStart.copy(getMouseProjectionOnBall(event.pageX, event.pageY));
            _rotateEnd.copy(_rotateStart);
        }
        else if (_state === STATE.ZOOM && !_this.noZoom) {
            _zoomStart.copy(getMouseOnScreen(event.pageX, event.pageY));
            _zoomEnd.copy(_zoomStart);
        }
        else if (_state === STATE.PAN && !_this.noPan) {
            _panStart.copy(getMouseOnScreen(event.pageX, event.pageY));
            _panEnd.copy(_panStart);
        }
        document.addEventListener('mousemove', mousemove, false);
        document.addEventListener('mouseup', mouseup, false);
        _this.dispatchEvent(startEvent);
    }
    function mousemove(event) {
        if (_this.enabled === false)
            return;
        event.preventDefault();
        event.stopPropagation();
        if (_state === STATE.ROTATE && !_this.noRotate) {
            _rotateEnd.copy(getMouseProjectionOnBall(event.pageX, event.pageY));
        }
        else if (_state === STATE.ZOOM && !_this.noZoom) {
            _zoomEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        }
        else if (_state === STATE.PAN && !_this.noPan) {
            _panEnd.copy(getMouseOnScreen(event.pageX, event.pageY));
        }
    }
    function mouseup(event) {
        if (_this.enabled === false)
            return;
        event.preventDefault();
        event.stopPropagation();
        _state = STATE.NONE;
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        _this.dispatchEvent(endEvent);
    }
    function mousewheel(event) {
        if (_this.enabled === false)
            return;
        event.preventDefault();
        event.stopPropagation();
        var delta = 0;
        if (event.wheelDelta) {
            delta = event.wheelDelta / 40;
        }
        else if (event.detail) {
            delta = -event.detail / 3;
        }
        _zoomStart.y += delta * 0.01;
        _this.dispatchEvent(startEvent);
        _this.dispatchEvent(endEvent);
    }
    function touchstart(event) {
        if (_this.enabled === false)
            return;
        switch (event.touches.length) {
            case 1:
                _state = STATE.TOUCH_ROTATE;
                _rotateStart.copy(getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY));
                _rotateEnd.copy(_rotateStart);
                break;
            case 2:
                _state = STATE.TOUCH_ZOOM_PAN;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _panStart.copy(getMouseOnScreen(x, y));
                _panEnd.copy(_panStart);
                break;
            default:
                _state = STATE.NONE;
        }
        _this.dispatchEvent(startEvent);
    }
    function touchmove(event) {
        if (_this.enabled === false)
            return;
        event.preventDefault();
        event.stopPropagation();
        switch (event.touches.length) {
            case 1:
                _rotateEnd.copy(getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY));
                break;
            case 2:
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _panEnd.copy(getMouseOnScreen(x, y));
                break;
            default:
                _state = STATE.NONE;
        }
    }
    function touchend(event) {
        if (_this.enabled === false)
            return;
        switch (event.touches.length) {
            case 1:
                _rotateEnd.copy(getMouseProjectionOnBall(event.touches[0].pageX, event.touches[0].pageY));
                _rotateStart.copy(_rotateEnd);
                break;
            case 2:
                _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
                var x = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                var y = (event.touches[0].pageY + event.touches[1].pageY) / 2;
                _panEnd.copy(getMouseOnScreen(x, y));
                _panStart.copy(_panEnd);
                break;
        }
        _state = STATE.NONE;
        _this.dispatchEvent(endEvent);
    }
    function contextmenu(event) {
        event.preventDefault();
    }
    this.detachFromContainer = function () {
        if (_this.domElement) {
            _this.domElement.removeEventListener('contextmenu', contextmenu, false);
            _this.domElement.removeEventListener('mousedown', mousedown, false);
            _this.domElement.removeEventListener('mousewheel', mousewheel, false);
            _this.domElement.removeEventListener('DOMMouseScroll', mousewheel, false); // firefox
            _this.domElement.removeEventListener('touchstart', touchstart, false);
            _this.domElement.removeEventListener('touchend', touchend, false);
            _this.domElement.removeEventListener('touchmove', touchmove, false);
        }
        window.removeEventListener('keydown', keydown, false);
        window.removeEventListener('keyup', keyup, false);
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        _state = STATE.NONE;
        _this.enabled = false;
        _this.domElement = null;
    };
    this.dispose = function () {
        _this.detachFromContainer();
    };
    this.destroy = function () {
        _this.dispose();
    };
    this.attachToContainer = function (element) {
        if (_this.domElement) {
            _this.detachFromContainer();
        }
        _this.domElement = (element !== undefined) ? element : document;
        if (_this.domElement) {
            _this.domElement.addEventListener('contextmenu', contextmenu, false);
            _this.domElement.addEventListener('mousedown', mousedown, false);
            _this.domElement.addEventListener('mousewheel', mousewheel, false);
            _this.domElement.addEventListener('DOMMouseScroll', mousewheel, false); // firefox
            _this.domElement.addEventListener('touchstart', touchstart, false);
            _this.domElement.addEventListener('touchend', touchend, false);
            _this.domElement.addEventListener('touchmove', touchmove, false);
            window.addEventListener('keydown', keydown, false);
            window.addEventListener('keyup', keyup, false);
            _this.enabled = true;
            _this.handleResize();
            // force an update at start
            _this.update();
        }
    };
    this.attachToContainer(domElement);
};
TrackballControls.prototype = Object.create(THREE.EventDispatcher.prototype);
module.exports = TrackballControls;

},{"@jibo/three":undefined}],137:[function(require,module,exports){
/**
 * @author jg
 * Copyright 2015 IF Robots LLC
 */
"use strict";
var THREE = require("@jibo/three");
var MouseCoordinateWrangler = require("./MouseCoordinateWrangler");
var AnchoredTargetVisualizer = require("./AnchoredTargetVisualizer");
var slog = require("../ifr-core/SLog");
var channel = "UI_TARGET";
/**
 * Callback to receive 3D position updates
 *
 * @callback positionChangedCallback
 * @param {THREE.Vector3} newPosition
 * @param {string} targetName
 * @intdocs
 */
/**
 * @param {string} name - name of this positioner, reported to listeners
 * @param {THREE.PerspectiveCamera} camera - camera that is projecting this scene
 * @param {THREE.Vector3} initialPosition - initial position, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} pointOnGroundPlane - any point on the ground plane, (0,0,0) will be used if omitted
 * @param {THREE.Vector3} groundPlaneNormal - normal of the ground plane, (0,1,0) will be used if omitted
 * @constructor
 */
var ViewportTargetPositioner = function (name, camera, initialPosition, pointOnGroundPlane, groundPlaneNormal) {
    /**
     * @type {string}
     * @private
     */
    this._name = name;
    /**
     * @type {THREE.PerspectiveCamera}
     * @private
     */
    this._camera = camera;
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._initialPosition = initialPosition;
    if (this._initialPosition == null) {
        this._initialPosition = new THREE.Vector3(0, 0, 0);
    }
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._pointOnGroundPlane = pointOnGroundPlane;
    if (this._pointOnGroundPlane == null) {
        this._pointOnGroundPlane = new THREE.Vector3(0, 0, 0);
    }
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._groundPlaneNormal = groundPlaneNormal;
    if (this._groundPlaneNormal == null) {
        this._groundPlaneNormal = new THREE.Vector3(0, 1, 0);
    }
    /**
     * @type {THREE.Vector3}
     * @private
     */
    this._lastPosition = new THREE.Vector3().copy(this._initialPosition);
    /**
     * @type {positionChangedCallback[]}
     * @private
     */
    this._positionChangedListeners = [];
    /**
     * @type {AnchoredTargetVisualizer}
     * @private
     */
    this._anchoredTargetVis = new AnchoredTargetVisualizer(this._groundPlaneNormal);
    if (this._lastPosition != null) {
        this._anchoredTargetVis.setPosition(this._lastPosition);
    }
};
/**
 * Move this positioner to the point represented by this NDC screen plane point, by either
 * moving the current target to be above the ground plane point clicked (if groundPlane is true),
 * or by moving the current target to the point clicked on the plane defined by camera's forward vector
 * and the current target (if groundPlane is false).
 *
 * @param {number} viewportNDCPointX - NDC (-1 to 1) X val on screen plane
 * @param {number} viewportNDCPointY - NDC (-1 to 1) Y val on screen plane
 * @param {boolean} groundPlane - treat as ground-plane point if true, treat as vertical plane if false
 */
ViewportTargetPositioner.prototype.moveToNDCPoint = function (viewportNDCPointX, viewportNDCPointY, groundPlane) {
    var p;
    if (groundPlane) {
        var groundPoint = MouseCoordinateWrangler.unprojectScreenToPlane(viewportNDCPointX, viewportNDCPointY, this._camera, this._pointOnGroundPlane, this._groundPlaneNormal);
        if (groundPoint != null) {
            p = new THREE.Vector3().copy(this._lastPosition).projectOnVector(this._groundPlaneNormal).add(groundPoint);
        }
        else {
            slog(channel, "ViewportTargetPositioner: ground point not computed, not moving target point");
        }
    }
    else {
        //find where camera is pointing:
        var pLocal = new THREE.Vector3(0, 0, -1);
        var pWorld = pLocal.applyMatrix4(this._camera.matrixWorld);
        var cameraDirection = pWorld.sub(this._camera.position);
        cameraDirection.projectOnPlane(this._groundPlaneNormal);
        var pointOnCameraPlane = this._lastPosition;
        if (cameraDirection.lengthSq() < 0.001) {
            slog(channel, "ViewportTargetPositioner: degenerate angle, not moving target point");
            p = undefined;
        }
        else {
            cameraDirection.normalize();
            p = MouseCoordinateWrangler.unprojectScreenToPlane(viewportNDCPointX, viewportNDCPointY, this._camera, pointOnCameraPlane, cameraDirection);
        }
    }
    if (p !== undefined) {
        this._lastPosition.copy(p);
        this._notifyPositionChangedCallbacks(p);
    }
    this._anchoredTargetVis.setPosition(this._lastPosition);
};
/**
 * Install a renderer into scene that will draw this mouse target.
 *
 * @param {BasicScene} scene
 */
ViewportTargetPositioner.prototype.installRendererIntoScene = function (scene) {
    this._anchoredTargetVis.installRendererIntoScene(scene);
};
/**
 * Remove the renderer from this scene.
 *
 * @param {BasicScene} scene
 */
ViewportTargetPositioner.prototype.removeRendererFromScene = function (scene) {
    this._anchoredTargetVis.removeRendererFromScene(scene);
};
/**
 * @param {THREE.Vector3} inplaceVec3
 * @return {THREE.Vector3}
 */
ViewportTargetPositioner.prototype.getPosition = function (inplaceVec3) {
    if (inplaceVec3 == null) {
        inplaceVec3 = new THREE.Vector3();
    }
    inplaceVec3.copy(this._lastPosition);
    return inplaceVec3;
};
/**
 * @param {positionChangedCallback} cb
 */
ViewportTargetPositioner.prototype.addPositionChangedCallback = function (cb) {
    var cbIndex = this._positionChangedListeners.indexOf(cb);
    if (cbIndex < 0) {
        this._positionChangedListeners.push(cb);
    }
};
/**
 * @param {positionChangedCallback} cb
 */
ViewportTargetPositioner.prototype.removePositionChangedCallback = function (cb) {
    var cbIndex = this._positionChangedListeners.indexOf(cb);
    if (cbIndex > -1) {
        this._positionChangedListeners.splice(cbIndex, 1);
    }
};
/**
 * @param {THREE.Vector3} position
 * @private
 */
ViewportTargetPositioner.prototype._notifyPositionChangedCallbacks = function (position) {
    for (var i = 0; i < this._positionChangedListeners.length; i++) {
        this._positionChangedListeners[i](position, this._name);
    }
};
/**
 * Renders more prominently if highlighted.  Defaults to true.
 * @param {boolean} highlighted
 */
ViewportTargetPositioner.prototype.setHighlighted = function (highlighted) {
    if (highlighted) {
        this._anchoredTargetVis.setLineWidth(2);
        this._anchoredTargetVis.setBrightness(1);
    }
    else {
        this._anchoredTargetVis.setLineWidth(0.5);
        this._anchoredTargetVis.setBrightness(0.5);
    }
};
/**
 * @returns {string}
 */
ViewportTargetPositioner.prototype.getName = function () {
    return this._name;
};
module.exports = ViewportTargetPositioner;

},{"../ifr-core/SLog":57,"./AnchoredTargetVisualizer":127,"./MouseCoordinateWrangler":133,"@jibo/three":undefined}],138:[function(require,module,exports){
"use strict";
if (global._animationutilities_singleton) {
    module.exports = global._animationutilities_singleton;
}
else {
    /** @type {JiboConfig} */
    module.exports.JiboConfig = require("./geometry-info/JiboConfig");
    /** @type {RobotInfo} */
    module.exports.RobotInfo = require("./geometry-info/RobotInfo");
    /** @type {RobotInfo} */
    module.exports.EyeKinematicsHelper = require("./geometry-info/EyeKinematicsHelper");
    /** @type {animate} */
    module.exports.animate = require("./animation-animate/AnimateImpl");
    /** @type {visualize} */
    module.exports.visualize = require("./animation-visualize/VisualizeImpl");
    /** @type {TimelineBuilder} */
    module.exports.TimelineBuilder = require("./animation-macros/TimelineBuilder");
    module.exports.core = {
        /** @type {FileTools} */
        FileTools: require("./ifr-core/FileTools"),
        /** @type {Time} */
        Time: require("./ifr-core/Time"),
        /** @type {Clock} */
        Clock: require("./ifr-core/Clock"),
        /** @type {slog} */
        slog: require("./ifr-core/SLog")
    };
    /** @type {Time} */
    module.exports.Time = module.exports.core.Time;
    /** @type {Clock} */
    module.exports.Clock = module.exports.core.Clock;
    /** @type {slog} */
    module.exports.slog = module.exports.core.slog;
    module.exports.MotionInterface = require("./animation-body/MotionInterface");
    module.exports.motion = {
        /** @type {Pose} */
        Pose: require("./ifr-motion/base/Pose")
    };
    module.exports.body = {
        /** @type {BodyOutput} */
        BodyVelocityOutput: require("./animation-body/BodyVelocityOutput"),
        /** @type {BodyOutput} */
        BodyTrajectoryOutput: require("./animation-body/BodyTrajectoryOutput"),
        /** @type {BodyOutput} */
        BodyPositionOutput: require("./animation-body/BodyPositionOutput"),
        /** @type {BodyOutput} */
        BodyPosVelOutput: require("./animation-body/BodyPosVelOutput"),
        /** @type {BodyOutput} */
        BodyPosVelComboOutput: require("./animation-body/BodyPosVelComboOutput"),
        /** @type {BodyOutput} */
        MotionServiceOutput: require("./animation-body/MotionServiceOutput"),
        /** @type {MotionLog} */
        MotionLog: require("./animation-body/MotionLog")
    };
    module.exports.ui = {
        /** @type {Bakery} */
        Bakery: require("./ifr-core/Bakery"),
        /** @type {JSONBaker} */
        JSONBaker: require("./ifr-core/JSONBaker")
    };
    //base classes used for defining client subclasses
    module.exports.protos = {
        /** @type {SampleCombiner} */
        SampleCombiner: require("./animation-animate/timeline/SampleCombiner"),
        /** @type {RenderPlugin} */
        RenderPlugin: require("./animation-visualize/RenderPlugin")
    };
    //classes to help with graphical display/interfaces
    module.exports.graphics = {
        /** @type {AnchoredTargetVisualizer} */
        AnchoredTargetVisualizer: require("./ifr-visualizer/AnchoredTargetVisualizer"),
        /** @type {GLTextOverlayPool} */
        GLTextOverlayPool: require("./ifr-visualizer/GLTextOverlayPool"),
        /** @type {GLLinePool} */
        GLLinePool: require("./ifr-visualizer/GLLinePool"),
        /** @type {GLSpherePool} */
        GLSpherePool: require("./ifr-visualizer/GLSpherePool")
    };
    module.exports.LEDOutput = require("./animation-body/LEDOutput");
    module.exports.AuxOutput = require("./animation-animate/timeline/AuxOutput");
    module.exports.MouseCoordinateWrangler = require("./ifr-visualizer/MouseCoordinateWrangler");
    module.exports.MouseTargetPositioner = require("./ifr-visualizer/MouseTargetPositioner");
    module.exports.TrajectoryControllerSim = require("./ifr-motion/feedback/TrajectoryControllerSim");
    module.exports.PosVelControllerSim = require("./ifr-motion/feedback/PosVelControllerSim");
    //we must use the same three instance when adding geometry
    module.exports.THREE = require("@jibo/three");
    //initialize default logging channels
    module.exports.slog.setPrintChannels([
        "ERROR",
        "WARN",
        "ATTENTION",
        "BODY_INTERFACE",
        //"INFO",
        "ACCEL_PLANNER",
        "CALIBRATION",
        //"LOOKAT",
        "MODEL_LOADING",
        //"MOUSE_COORD_WRANGLER",
        "RENDER_PLUGIN"
        //"UI_TARGET"
    ]);
    global._animationutilities_singleton = module.exports;
}

},{"./animation-animate/AnimateImpl":2,"./animation-animate/timeline/AuxOutput":7,"./animation-animate/timeline/SampleCombiner":19,"./animation-body/BodyPosVelComboOutput":27,"./animation-body/BodyPosVelOutput":28,"./animation-body/BodyPositionOutput":29,"./animation-body/BodyTrajectoryOutput":30,"./animation-body/BodyVelocityOutput":31,"./animation-body/LEDOutput":34,"./animation-body/MotionInterface":35,"./animation-body/MotionLog":36,"./animation-body/MotionServiceOutput":37,"./animation-macros/TimelineBuilder":38,"./animation-visualize/RenderPlugin":42,"./animation-visualize/VisualizeImpl":44,"./geometry-info/EyeKinematicsHelper":46,"./geometry-info/JiboConfig":48,"./geometry-info/RobotInfo":50,"./ifr-core/Bakery":52,"./ifr-core/Clock":53,"./ifr-core/FileTools":54,"./ifr-core/JSONBaker":55,"./ifr-core/SLog":57,"./ifr-core/Time":58,"./ifr-motion/base/Pose":78,"./ifr-motion/feedback/PosVelControllerSim":94,"./ifr-motion/feedback/TrajectoryControllerSim":95,"./ifr-visualizer/AnchoredTargetVisualizer":127,"./ifr-visualizer/GLLinePool":129,"./ifr-visualizer/GLSpherePool":131,"./ifr-visualizer/GLTextOverlayPool":132,"./ifr-visualizer/MouseCoordinateWrangler":133,"./ifr-visualizer/MouseTargetPositioner":134,"@jibo/three":undefined}]},{},[138])(138)
});

//# sourceMappingURL=animation-utilities.js.map
