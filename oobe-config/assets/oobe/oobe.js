(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
var Ease = cjs.Ease;
var Sprite = cjs.Sprite;
var MovieClip = cjs.MovieClip;
var Tween = cjs.Tween;
var Rectangle = cjs.Rectangle;
var Shape = cjs.Shape;
lib.webFontTxtFilters = {}; 

// library properties:




lib.webfontAvailable = function(family) { 
	lib.properties.webfonts[family] = true;
	var txtFilters = lib.webFontTxtFilters && lib.webFontTxtFilters[family] || [];
	for(var f = 0; f < txtFilters.length; ++f) {
		txtFilters[f].updateCache();
	}
};
// symbols:



(lib.blueRing1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(0);
}).prototype = p = new Sprite();



(lib.ErrorIcon1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(1);
}).prototype = p = new Sprite();



(lib.glow = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(2);
}).prototype = p = new Sprite();



(lib.Go2AppText1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(3);
}).prototype = p = new Sprite();



(lib.JiboLogo_PP = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(4);
}).prototype = p = new Sprite();



(lib.LoaderDots1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(5);
}).prototype = p = new Sprite();



(lib.loadingIcon1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(6);
}).prototype = p = new Sprite();



(lib.loadingIcon10 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(7);
}).prototype = p = new Sprite();



(lib.loadingIcon11 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(8);
}).prototype = p = new Sprite();



(lib.loadingIcon12 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(9);
}).prototype = p = new Sprite();



(lib.loadingIcon2 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(10);
}).prototype = p = new Sprite();



(lib.loadingIcon3 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(11);
}).prototype = p = new Sprite();



(lib.loadingIcon4 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(12);
}).prototype = p = new Sprite();



(lib.loadingIcon5 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(13);
}).prototype = p = new Sprite();



(lib.loadingIcon6 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(14);
}).prototype = p = new Sprite();



(lib.loadingIcon7 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(15);
}).prototype = p = new Sprite();



(lib.loadingIcon8 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(16);
}).prototype = p = new Sprite();



(lib.loadingIcon9 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(17);
}).prototype = p = new Sprite();



(lib.NextCode_text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(18);
}).prototype = p = new Sprite();



(lib.Plugin_Text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(19);
}).prototype = p = new Sprite();



(lib.PowerWarningContent1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(20);
}).prototype = p = new Sprite();



(lib.QRCode1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(21);
}).prototype = p = new Sprite();



(lib.QRFlash1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(22);
}).prototype = p = new Sprite();



(lib.Ring1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(23);
}).prototype = p = new Sprite();



(lib.Ring2 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(24);
}).prototype = p = new Sprite();



(lib.Ring3 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(25);
}).prototype = p = new Sprite();



(lib.TimeToReboot_Text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(26);
}).prototype = p = new Sprite();



(lib.VFTextSpecific_graphics1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(27);
}).prototype = p = new Sprite();



(lib.Viewfinder_Text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(28);
}).prototype = p = new Sprite();



(lib.Wifi_Black11 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(29);
}).prototype = p = new Sprite();



(lib.WiFi_Black21 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(30);
}).prototype = p = new Sprite();



(lib.WiFi_Black31 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(31);
}).prototype = p = new Sprite();



(lib.WiFi_Black41 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(32);
}).prototype = p = new Sprite();



(lib.WiFi_Connected_Text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(33);
}).prototype = p = new Sprite();



(lib.WiFi_Green11 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(34);
}).prototype = p = new Sprite();



(lib.WiFi_Green21 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(35);
}).prototype = p = new Sprite();



(lib.WiFi_Green31 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(36);
}).prototype = p = new Sprite();



(lib.WiFi_Green41 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(37);
}).prototype = p = new Sprite();



(lib.Wifi_Text1 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(38);
}).prototype = p = new Sprite();



(lib.WiFi_White11 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(39);
}).prototype = p = new Sprite();



(lib.WiFi_White21 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(40);
}).prototype = p = new Sprite();



(lib.WiFi_White31 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(41);
}).prototype = p = new Sprite();



(lib.WiFi_White41 = function() {
	var spriteSheet;
	spriteSheet = this.spriteSheet = ss["oobe_atlas_"];
	this.gotoAndStop(42);
}).prototype = p = new Sprite();



(lib.Viewfinder_Text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Viewfinder_Text1();
	instance.setTransform(-474.8,-15.8);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-474.8,-15.8,950,32);


(lib.VFTextSpecific_graphics = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.VFTextSpecific_graphics1();
	instance.setTransform(-480.4,-38);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-480.4,-38,961,76);


(lib.TimeToReboot_Text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.TimeToReboot_Text1();
	instance.setTransform(-346.2,-170);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-346.2,-170,693,406);


(lib.PowerWarningContent = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.PowerWarningContent1();
	instance.setTransform(-346.9,-262.8);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-346.9,-262.8,694,526);


(lib.NextCode_text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.NextCode_text1();
	instance.setTransform(-461.3,-160);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-461.3,-160,923,430.2);


(lib.ssid = function(mode,startPosition,loop) {
	var ssid;
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	ssid = this.ssid = new cjs.Text("name of wifi network", "45px 'Proxima Nova Lt'", "#FFFFFF");
	ssid.name = "ssid";
	ssid.textAlign = "center";
	ssid.lineHeight = 54;
	ssid.setTransform(-2,-24.5);

	this.timeline.addTween(Tween.get(ssid).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-202.9,-24.5,405.9,49);


(lib.loadingIcon = function(mode,startPosition,loop) {
	var instance_11;
	var instance_10;
	var instance_9;
	var instance_8;
	var instance_7;
	var instance_6;
	var instance_5;
	var instance_4;
	var instance_3;
	var instance_2;
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{brain:0,bulb:1,window:2,chip:3,tools:4,word:5,space:6,pizza:7,pretzel:8,shark:9,clock:10,bubbles:11});

	// bitmap
	instance = this.instance = new lib.loadingIcon1();
	instance.setTransform(-135.7,-134.4,0.906,0.906);

	instance_1 = this.instance_1 = new lib.loadingIcon2();
	instance_1.setTransform(-98.1,-136.1,0.906,0.906);

	instance_2 = this.instance_2 = new lib.loadingIcon3();
	instance_2.setTransform(-111.8,-95.1,0.906,0.906);

	instance_3 = this.instance_3 = new lib.loadingIcon4();
	instance_3.setTransform(-119.4,-119.4,0.906,0.906);

	instance_4 = this.instance_4 = new lib.loadingIcon5();
	instance_4.setTransform(-148.5,-121.9,0.906,0.906);

	instance_5 = this.instance_5 = new lib.loadingIcon6();
	instance_5.setTransform(-127.6,-98.2,0.906,0.906);

	instance_6 = this.instance_6 = new lib.loadingIcon7();
	instance_6.setTransform(-135.4,-121.3,0.906,0.906);

	instance_7 = this.instance_7 = new lib.loadingIcon8();
	instance_7.setTransform(-104.8,-105.6,0.906,0.906);

	instance_8 = this.instance_8 = new lib.loadingIcon9();
	instance_8.setTransform(-130,-82.1,0.906,0.906);

	instance_9 = this.instance_9 = new lib.loadingIcon10();
	instance_9.setTransform(-141.7,-82.9,0.906,0.906);

	instance_10 = this.instance_10 = new lib.loadingIcon11();
	instance_10.setTransform(-105,-109.9,0.906,0.906);

	instance_11 = this.instance_11 = new lib.loadingIcon12();
	instance_11.setTransform(-128.4,-116.2,0.906,0.906);

	this.timeline.addTween(Tween.get({}).to({state:[{t:instance}]}).to({state:[{t:instance_1}]},1).to({state:[{t:instance_2}]},1).to({state:[{t:instance_3}]},1).to({state:[{t:instance_4}]},1).to({state:[{t:instance_5}]},1).to({state:[{t:instance_6}]},1).to({state:[{t:instance_7}]},1).to({state:[{t:instance_8}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_10}]},1).to({state:[{t:instance_11}]},1).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-135.7,-134.4,271.8,269);


(lib.jiboLogo = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	instance = this.instance = new lib.JiboLogo_PP();
	instance.setTransform(-300,-170);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-300,-170,600,340);


(lib.blueRing = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.blueRing1();
	instance.setTransform(-247,-247.3);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-247,-247.3,496,496);


(lib.WiFi_White4 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_White41();
	instance.setTransform(-222.9,-60);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-222.9,-60,446,120.1);


(lib.WiFi_White3 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_White31();
	instance.setTransform(-163,-48.7);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-163,-48.7,326,97.5);


(lib.WiFi_White2 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_White21();
	instance.setTransform(-102.4,-36.1);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-102.4,-36.1,205,72.4);


(lib.WiFi_White1 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_White11();
	instance.setTransform(-45.1,-45.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-45.1,-45.5,90.3,91);


(lib.Wifi_Text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Wifi_Text1();
	instance.setTransform(-263.2,-32.9);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-263.2,-32.9,525.2,71);


(lib.WiFi_Green4 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Green41();
	instance.setTransform(-222.9,-60);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-222.9,-60,446,120.1);


(lib.WiFi_Green3 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Green31();
	instance.setTransform(-163,-48.7);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-163,-48.7,326,97.5);


(lib.WiFi_Green2 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Green21();
	instance.setTransform(-102.3,-36.1);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-102.3,-36.1,205,72.4);


(lib.WiFi_Green1 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Green11();
	instance.setTransform(-45.1,-45.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-45.1,-45.5,90.3,91);


(lib.WiFi_Connected_Text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Connected_Text1();
	instance.setTransform(-213.3,-48.4);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-213.3,-48.4,424,55.3);


(lib.WiFi_Black4 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Black41();
	instance.setTransform(-222.9,-60);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-222.9,-60,446,120.1);


(lib.WiFi_Black3 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Black31();
	instance.setTransform(-163,-48.7);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-163,-48.7,326,97.5);


(lib.WiFi_Black2 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.WiFi_Black21();
	instance.setTransform(-102.4,-36.1);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-102.4,-36.1,205,72.4);


(lib.Wifi_Black1 = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Wifi_Black11();
	instance.setTransform(-45.1,-45.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-45.1,-45.5,90.3,91);


(lib.Ring = function(mode,startPosition,loop) {
	var instance_2;
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Ring1();
	instance.setTransform(-247.2,-247.3,0.891,0.891);

	instance_1 = this.instance_1 = new lib.Ring2();
	instance_1.setTransform(-247.2,-247.3,0.891,0.891);

	instance_2 = this.instance_2 = new lib.Ring3();
	instance_2.setTransform(-246.4,-246.8,0.891,0.891);

	this.timeline.addTween(Tween.get({}).to({state:[{t:instance}]}).to({state:[{t:instance_1}]},1).to({state:[{t:instance_2}]},1).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-247.8,-247.8,495.7,495.7);


(lib.QRFlash = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.QRFlash1();
	instance.setTransform(-239.5,-236.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-239.5,-236.5,483,483);


(lib.QRCode = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.QRCode1();
	instance.setTransform(-239.5,-236.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-239.5,-236.5,483,483);


(lib.Plugin_Text = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Plugin_Text1();
	instance.setTransform(-332.5,-137);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-332.5,-137,665,274);


(lib.loadingText = function(mode,startPosition,loop) {
	var textfield;
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	textfield = this.textfield = new cjs.Text("Operating update system", "55px 'Proxima Nova Lt'", "#FFFFFF");
	textfield.name = "textfield";
	textfield.textAlign = "center";
	textfield.lineHeight = 57;
	textfield.lineWidth = 996;
	textfield.setTransform(-2,-30);

	this.timeline.addTween(Tween.get(textfield).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-500,-30,1000,59);


(lib.LoaderDots = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.LoaderDots1();
	instance.setTransform(-52.2,-21.3,0.881,0.881);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-52.2,-21.3,104.4,42.6);


(lib.Glow = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	instance = this.instance = new lib.glow();
	instance.setTransform(-297.4,-280.3);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-297.4,-280.3,579,580);


(lib.ErrorMessage = function(mode,startPosition,loop) {
	var errorCode;
	var message;
	var instructions;
	var macAddress;
	this.initialize(mode,startPosition,loop,{});

	// macAddress
	macAddress = this.macAddress = new cjs.Text("MAC Address:", "30px 'Proxima Nova Lt'", "#828191");
	macAddress.name = "macAddress";
	macAddress.textAlign = "center";
	macAddress.lineHeight = 32;
	macAddress.lineWidth = 912;
	macAddress.setTransform(-2,290);

	this.timeline.addTween(Tween.get(macAddress).wait(1));

	// tapMessage
	instructions = this.instructions = new cjs.Text("Tap here to connect with your new code...", "45px 'Proxima Nova Lt'", "#FFFFFF");
	instructions.name = "instructions";
	instructions.textAlign = "center";
	instructions.lineHeight = 47;
	instructions.lineWidth = 1202;
	instructions.setTransform(-2.1,210,1.028,1);

	this.timeline.addTween(Tween.get(instructions).wait(1));

	// instructions
	message = this.message = new cjs.Text("Here's how to fix it...", "45px 'Proxima Nova Lt'", "#FFFFFF");
	message.name = "message";
	message.textAlign = "center";
	message.lineHeight = 47;
	message.lineWidth = 1202;
	message.setTransform(-2.1,40,1.028,1);

	this.timeline.addTween(Tween.get(message).wait(1));

	// errorCode
	errorCode = this.errorCode = new cjs.Text("Error Code Here", "bold 80px 'Proxima Nova Soft'", "#FFFFFF");
	errorCode.name = "errorCode";
	errorCode.textAlign = "center";
	errorCode.lineHeight = 82;
	errorCode.lineWidth = 1202;
	errorCode.setTransform(-2.1,-62,1.028,1);

	this.timeline.addTween(Tween.get(errorCode).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-620,-62,1240,386);


(lib.Go2AppText = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.Go2AppText1();
	instance.setTransform(-535.3,-310);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-535.3,-310,1071,566.1);


(lib.ErrorIcon = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// bitmap
	instance = this.instance = new lib.ErrorIcon1();
	instance.setTransform(-81.5,-71.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-81.5,-71.5,163,143.1);


(lib.ViewfinderText_specific = function(mode,startPosition,loop) {
	var instance;
	var counter;
	this.initialize(mode,startPosition,loop,{});

	// counter
	counter = this.counter = new cjs.Text("00", "bold 55px 'Proxima Nova Soft'", "#FFFFFF");
	counter.name = "counter";
	counter.textAlign = "center";
	counter.lineHeight = 57;
	counter.lineWidth = 72;
	counter.setTransform(-88.1,-30);

	this.timeline.addTween(Tween.get(counter).wait(1));

	// grafx
	instance = this.instance = new lib.VFTextSpecific_graphics();
	instance.setTransform(0,-0.5);

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-480.4,-38.5,961,76);


(lib.PowerWarning = function(mode,startPosition,loop) {
	var shape;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	instance = this.instance = new lib.PowerWarningContent();
	instance.setTransform(641,358);

	shape = this.shape = new Shape();
	shape.graphics.f("rgba(6,6,6,0.647)").s().p("Ehj/A4QMAAAhwfMDH+AAAMAAABwfg");
	shape.setTransform(640,360);

	this.timeline.addTween(Tween.get({}).to({state:[{t:shape},{t:instance}]}).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(0,0,1280,720);


(lib.OpenApp_Text = function(mode,startPosition,loop) {
	var instance;
	var macAddress;
	this.initialize(mode,startPosition,loop,{});

	// macAddress
	macAddress = this.macAddress = new cjs.Text("MAC Address:", "30px 'Proxima Nova Lt'", "#828191");
	macAddress.name = "macAddress";
	macAddress.textAlign = "center";
	macAddress.lineHeight = 32;
	macAddress.lineWidth = 956;
	macAddress.setTransform(-2,290);

	this.timeline.addTween(Tween.get(macAddress).wait(1));

	// FlashAICB
	instance = this.instance = new lib.Go2AppText();

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-535.3,-310,1071,636);


(lib.NextCode = function(mode,startPosition,loop) {
	var instance;
	var macAddress;
	var counter;
	this.initialize(mode,startPosition,loop,{});

	// counter
	counter = this.counter = new cjs.Text("00", "bold 55px 'Proxima Nova Soft'", "#FFFFFF");
	counter.name = "counter";
	counter.textAlign = "center";
	counter.lineHeight = 57;
	counter.lineWidth = 72;
	counter.setTransform(333,203);

	this.timeline.addTween(Tween.get(counter).wait(1));

	// macAddress
	macAddress = this.macAddress = new cjs.Text("MAC Address:", "30px 'Proxima Nova Lt'", "#828191");
	macAddress.name = "macAddress";
	macAddress.textAlign = "center";
	macAddress.lineHeight = 32;
	macAddress.lineWidth = 956;
	macAddress.setTransform(-2,290);

	this.timeline.addTween(Tween.get(macAddress).wait(1));

	// FlashAICB
	instance = this.instance = new lib.NextCode_text();

	this.timeline.addTween(Tween.get(instance).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-480,-160,960,486);


(lib.LoaderIconsText = function(mode,startPosition,loop) {
	var loadingIcon;
	var loadingText;
	this.initialize(mode,startPosition,loop,{showIcon:0,showIcon_stop:22,hideIcon:23,hideIcon_stop:40});

	// loadingText
	loadingText = this.loadingText = new lib.loadingText();
	loadingText.setTransform(0,320);
	loadingText.alpha = 0;

	this.timeline.addTween(Tween.get(loadingText).wait(1).to({regY:-0.5,y:319.5,alpha:0.007},0).wait(1).to({alpha:0.029},0).wait(1).to({alpha:0.069},0).wait(1).to({alpha:0.133},0).wait(1).to({alpha:0.224},0).wait(1).to({alpha:0.346},0).wait(1).to({alpha:0.493},0).wait(1).to({alpha:0.648},0).wait(1).to({alpha:0.785},0).wait(1).to({alpha:0.888},0).wait(1).to({alpha:0.954},0).wait(1).to({alpha:0.989},0).wait(1).to({regY:0,y:320,alpha:1},0).wait(10).to({alpha:0},8).wait(10));

	// loadingIcon
	loadingIcon = this.loadingIcon = new lib.loadingIcon();
	loadingIcon.setTransform(0,0,0.332,0.332);
	loadingIcon.alpha = 0;

	this.timeline.addTween(Tween.get(loadingIcon).wait(1).to({regY:3.3,scaleX:0.34,scaleY:0.34,y:1.1,alpha:0.009},0).wait(1).to({scaleX:0.36,scaleY:0.36,y:1.2,alpha:0.041},0).wait(1).to({scaleX:0.41,scaleY:0.41,y:1.4,alpha:0.101},0).wait(1).to({scaleX:0.48,scaleY:0.48,y:1.6,alpha:0.196},0).wait(1).to({scaleX:0.59,scaleY:0.59,y:2,alpha:0.334},0).wait(1).to({scaleX:0.72,scaleY:0.72,y:2.4,alpha:0.507},0).wait(1).to({scaleX:0.86,scaleY:0.86,y:2.9,alpha:0.688},0).wait(1).to({scaleX:0.98,scaleY:0.98,y:3.3,alpha:0.836},0).wait(1).to({scaleX:1.05,scaleY:1.05,y:3.5,alpha:0.934},0).wait(1).to({scaleX:1.09,scaleY:1.09,y:3.6,alpha:0.985},0).wait(1).to({regY:0,scaleX:1.1,scaleY:1.1,y:0,alpha:1},0).wait(1).to({regY:3.3,scaleX:1.1,scaleY:1.1,y:3.7},0).wait(1).to({scaleX:1.1,scaleY:1.1},0).wait(1).to({scaleX:1.09,scaleY:1.09,y:3.6},0).wait(1).to({scaleX:1.08,scaleY:1.08},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.05,scaleY:1.05,y:3.5},0).wait(1).to({scaleX:1.03,scaleY:1.03,y:3.4},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1.01,scaleY:1.01,y:3.3},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regY:0,scaleX:1,scaleY:1,y:0},0).wait(2).to({regY:3.3,scaleX:1,scaleY:1,y:3.3},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({scaleX:1.01,scaleY:1.01,y:3.4},0).wait(1).to({scaleX:1.03,scaleY:1.03},0).wait(1).to({scaleX:1.05,scaleY:1.05,y:3.5},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.07,scaleY:1.07,y:3.6},0).wait(1).to({regY:0,scaleX:1.07,scaleY:1.07,y:0},0).wait(1).to({regY:3.3,scaleX:1.06,scaleY:1.06,y:3.5,alpha:0.986},0).wait(1).to({scaleX:1.03,scaleY:1.03,y:3.4,alpha:0.936},0).wait(1).to({scaleX:0.95,scaleY:0.95,y:3.2,alpha:0.84},0).wait(1).to({scaleX:0.84,scaleY:0.84,y:2.8,alpha:0.684},0).wait(1).to({scaleX:0.68,scaleY:0.68,y:2.3,alpha:0.472},0).wait(1).to({scaleX:0.52,scaleY:0.52,y:1.8,alpha:0.257},0).wait(1).to({scaleX:0.41,scaleY:0.41,y:1.4,alpha:0.103},0).wait(1).to({scaleX:0.35,scaleY:0.35,y:1.2,alpha:0.023},0).wait(1).to({regY:0,scaleX:0.33,scaleY:0.33,y:0,alpha:0},0).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-500,-44.6,1000,393.7);


(lib.Wifi_Connecting_Loop = function(mode,startPosition,loop) {
	var instance_7;
	var instance_6;
	var instance_5;
	var instance_4;
	var instance_3;
	var instance_2;
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// white 4
	instance = this.instance = new lib.WiFi_White4("synched",0);
	instance.setTransform(0,-116.5,0.808,0.808);
	instance.alpha = 0;
	instance._off = true;

	this.timeline.addTween(Tween.get(instance).wait(23).to({_off:false},0).wait(1).to({scaleX:0.83,scaleY:0.83,y:-115.9,alpha:0.097},0).wait(1).to({scaleX:0.94,scaleY:0.94,y:-113.2,alpha:0.503},0).wait(1).to({scaleX:1.04,scaleY:1.04,y:-110.5,alpha:0.905},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:-109.9,alpha:1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.05,scaleY:1.05},0).wait(1).to({scaleX:1.03,scaleY:1.03},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1,scaleY:1,mode:"single"},0).to({_off:true},17).wait(16));

	// white 3
	instance_1 = this.instance_1 = new lib.WiFi_White3("synched",0);
	instance_1.setTransform(0,-44.5,0.764,0.764);
	instance_1.alpha = 0;
	instance_1._off = true;

	this.timeline.addTween(Tween.get(instance_1).wait(15).to({_off:false},0).wait(1).to({regY:-0.2,scaleX:0.78,scaleY:0.78,y:-44.4,alpha:0.058},0).wait(1).to({scaleX:0.86,scaleY:0.86,y:-43.2,alpha:0.298},0).wait(1).to({scaleX:0.99,scaleY:0.99,y:-41.3,alpha:0.706},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:-40.2,alpha:0.943},0).wait(1).to({regY:0,scaleX:1.08,scaleY:1.08,y:-39.8,alpha:1},0).wait(1).to({regY:-0.2,scaleX:1.08,scaleY:1.08,y:-40},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regY:0,scaleX:1,scaleY:1,y:-39.8},0).to({_off:true},24).wait(16));

	// white 2
	instance_2 = this.instance_2 = new lib.WiFi_White2("synched",0);
	instance_2.setTransform(0,25.8,0.682,0.682);
	instance_2.alpha = 0;
	instance_2._off = true;

	this.timeline.addTween(Tween.get(instance_2).wait(7).to({_off:false},0).wait(1).to({regX:0.1,regY:-0.1,scaleX:0.71,scaleY:0.71,x:0.1,y:26,alpha:0.058},0).wait(1).to({scaleX:0.81,scaleY:0.81,y:27.1,alpha:0.298},0).wait(1).to({scaleX:0.99,scaleY:0.99,y:29,alpha:0.706},0).wait(1).to({scaleX:1.1,scaleY:1.1,y:30.1,alpha:0.943},0).wait(1).to({regX:0,regY:0,scaleX:1.12,scaleY:1.12,x:0,y:30.5,alpha:1},0).wait(1).to({regX:0.1,regY:-0.1,scaleX:1.12,scaleY:1.12,x:0.1,y:30.4},0).wait(1).to({scaleX:1.1,scaleY:1.1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,regY:0,scaleX:1,scaleY:1,x:0,y:30.5},0).to({_off:true},32).wait(16));

	// white 1
	instance_3 = this.instance_3 = new lib.WiFi_White1("synched",0);
	instance_3.setTransform(-0.1,124.5,0.6,0.6,0,0,0,-0.1,0);
	instance_3.alpha = 0;

	this.timeline.addTween(Tween.get(instance_3).wait(1).to({scaleX:0.65,scaleY:0.65,x:0,alpha:0.097},0).wait(1).to({scaleX:0.84,scaleY:0.84,x:-0.1,alpha:0.503},0).wait(1).to({scaleX:1.04,scaleY:1.04,alpha:0.905},0).wait(1).to({regX:0,scaleX:1.09,scaleY:1.09,x:0,alpha:1},0).wait(1).to({regX:-0.1,scaleX:1.08,scaleY:1.08,x:-0.1},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,scaleX:1,scaleY:1,x:0},0).to({_off:true},40).wait(16));

	// black 4
	instance_4 = this.instance_4 = new lib.WiFi_Black4("synched",0);
	instance_4.setTransform(0,-109.9);

	this.timeline.addTween(Tween.get(instance_4).wait(66));

	// black 3
	instance_5 = this.instance_5 = new lib.WiFi_Black3("single",0);
	instance_5.setTransform(0,-39.8);

	this.timeline.addTween(Tween.get(instance_5).wait(66));

	// black 2
	instance_6 = this.instance_6 = new lib.WiFi_Black2("single",0);
	instance_6.setTransform(0,30.5);

	this.timeline.addTween(Tween.get(instance_6).wait(66));

	// black 1
	instance_7 = this.instance_7 = new lib.Wifi_Black1("single",0);
	instance_7.setTransform(0,124.5);

	this.timeline.addTween(Tween.get(instance_7).wait(66));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-222.9,-170,446,340);


(lib.Wifi_Connecting = function(mode,startPosition,loop) {
	var instance_7;
	var instance_6;
	var instance_5;
	var instance_4;
	var instance_3;
	var instance_2;
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// white 4
	instance = this.instance = new lib.WiFi_White4("synched",0);
	instance.setTransform(0,-115.6,0.808,0.808);
	instance.alpha = 0;
	instance._off = true;

	this.timeline.addTween(Tween.get(instance).wait(23).to({_off:false},0).wait(1).to({scaleX:0.83,scaleY:0.83,y:-115,alpha:0.097},0).wait(1).to({scaleX:0.94,scaleY:0.94,y:-112.7,alpha:0.503},0).wait(1).to({scaleX:1.04,scaleY:1.04,y:-110.4,alpha:0.905},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:-109.9,alpha:1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.05,scaleY:1.05},0).wait(1).to({scaleX:1.03,scaleY:1.03},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1,scaleY:1},0).to({_off:true},17).wait(16));

	// white 3
	instance_1 = this.instance_1 = new lib.WiFi_White3("synched",0);
	instance_1.setTransform(0,-44.5,0.764,0.764);
	instance_1.alpha = 0;
	instance_1._off = true;

	this.timeline.addTween(Tween.get(instance_1).wait(15).to({_off:false},0).wait(1).to({regY:-0.2,scaleX:0.78,scaleY:0.78,y:-44.4,alpha:0.058},0).wait(1).to({scaleX:0.86,scaleY:0.86,y:-43.2,alpha:0.298},0).wait(1).to({scaleX:0.99,scaleY:0.99,y:-41.3,alpha:0.706},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:-40.2,alpha:0.943},0).wait(1).to({regY:0,scaleX:1.08,scaleY:1.08,y:-39.8,alpha:1},0).wait(1).to({regY:-0.2,scaleX:1.08,scaleY:1.08,y:-40},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regY:0,scaleX:1,scaleY:1,y:-39.8},0).to({_off:true},24).wait(16));

	// white 2
	instance_2 = this.instance_2 = new lib.WiFi_White2("synched",0);
	instance_2.setTransform(0,25.8,0.682,0.682);
	instance_2.alpha = 0;
	instance_2._off = true;

	this.timeline.addTween(Tween.get(instance_2).wait(7).to({_off:false},0).wait(1).to({regX:0.1,regY:-0.1,scaleX:0.71,scaleY:0.71,x:0.1,y:26,alpha:0.058},0).wait(1).to({scaleX:0.81,scaleY:0.81,y:27.1,alpha:0.298},0).wait(1).to({scaleX:0.99,scaleY:0.99,y:29,alpha:0.706},0).wait(1).to({scaleX:1.1,scaleY:1.1,y:30.1,alpha:0.943},0).wait(1).to({regX:0,regY:0,scaleX:1.12,scaleY:1.12,x:0,y:30.5,alpha:1},0).wait(1).to({regX:0.1,regY:-0.1,scaleX:1.12,scaleY:1.12,x:0.1,y:30.4},0).wait(1).to({scaleX:1.1,scaleY:1.1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,regY:0,scaleX:1,scaleY:1,x:0,y:30.5},0).to({_off:true},32).wait(16));

	// white 1
	instance_3 = this.instance_3 = new lib.WiFi_White1("synched",0);
	instance_3.setTransform(-0.1,124.5,0.6,0.6,0,0,0,-0.1,0);
	instance_3.alpha = 0;

	this.timeline.addTween(Tween.get(instance_3).wait(1).to({scaleX:0.65,scaleY:0.65,x:0,alpha:0.097},0).wait(1).to({scaleX:0.84,scaleY:0.84,x:-0.1,alpha:0.503},0).wait(1).to({scaleX:1.04,scaleY:1.04,alpha:0.905},0).wait(1).to({regX:0,scaleX:1.09,scaleY:1.09,x:0,alpha:1},0).wait(1).to({regX:-0.1,scaleX:1.08,scaleY:1.08,x:-0.1},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,scaleX:1,scaleY:1,x:0},0).to({_off:true},40).wait(16));

	// black 4
	instance_4 = this.instance_4 = new lib.WiFi_Black4("synched",0);
	instance_4.setTransform(0,-109.9);
	instance_4._off = true;

	this.timeline.addTween(Tween.get(instance_4).wait(50).to({_off:false},0).wait(16));

	// black 3
	instance_5 = this.instance_5 = new lib.WiFi_Black3("single",0);
	instance_5.setTransform(0,-39.8);
	instance_5._off = true;

	this.timeline.addTween(Tween.get(instance_5).wait(50).to({_off:false},0).wait(16));

	// black 2
	instance_6 = this.instance_6 = new lib.WiFi_Black2("single",0);
	instance_6.setTransform(0,30.5);
	instance_6._off = true;

	this.timeline.addTween(Tween.get(instance_6).wait(50).to({_off:false},0).wait(16));

	// black 1
	instance_7 = this.instance_7 = new lib.Wifi_Black1("single",0);
	instance_7.setTransform(0,124.5);
	instance_7._off = true;

	this.timeline.addTween(Tween.get(instance_7).wait(50).to({_off:false},0).wait(16));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-27.1,97.2,54,54.6);


(lib.Wifi_Connected = function(mode,startPosition,loop) {
	var instance_7;
	var instance_6;
	var instance_5;
	var instance_4;
	var instance_3;
	var instance_2;
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// white 4
	instance = this.instance = new lib.WiFi_Green4("synched",0);
	instance.setTransform(0,-116.5,0.808,0.808);
	instance.alpha = 0;
	instance._off = true;

	this.timeline.addTween(Tween.get(instance).wait(18).to({_off:false},0).wait(1).to({scaleX:0.86,scaleY:0.86,y:-115.3,alpha:0.191},0).wait(1).to({scaleX:1.01,scaleY:1.01,y:-111.2,alpha:0.811},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:-109.9,alpha:1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1,scaleY:1},0).wait(8));

	// white 3
	instance_1 = this.instance_1 = new lib.WiFi_Green3("synched",0);
	instance_1.setTransform(0,-44.5,0.764,0.764);
	instance_1.alpha = 0;
	instance_1._off = true;

	this.timeline.addTween(Tween.get(instance_1).wait(12).to({_off:false},0).wait(1).to({regY:-0.2,scaleX:0.8,scaleY:0.8,y:-44.2,alpha:0.097},0).wait(1).to({scaleX:0.92,scaleY:0.92,y:-42.3,alpha:0.503},0).wait(1).to({scaleX:1.05,scaleY:1.05,y:-40.4,alpha:0.905},0).wait(1).to({regY:0,scaleX:1.08,scaleY:1.08,y:-39.8,alpha:1},0).wait(1).to({regY:-0.2,scaleX:1.08,scaleY:1.08,y:-40},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regY:0,scaleX:1,scaleY:1,y:-39.8},0).wait(13));

	// white 2
	instance_2 = this.instance_2 = new lib.WiFi_Green2("synched",0);
	instance_2.setTransform(0,25.8,0.682,0.682);
	instance_2.alpha = 0;
	instance_2._off = true;

	this.timeline.addTween(Tween.get(instance_2).wait(6).to({_off:false},0).wait(1).to({regX:0.2,regY:-0.1,scaleX:0.72,scaleY:0.72,x:0.2,y:26.2,alpha:0.097},0).wait(1).to({scaleX:0.9,scaleY:0.9,y:28,alpha:0.503},0).wait(1).to({scaleX:1.08,scaleY:1.08,y:29.9,alpha:0.905},0).wait(1).to({regX:0,regY:0,scaleX:1.12,scaleY:1.12,x:0,y:30.5,alpha:1},0).wait(1).to({regX:0.2,regY:-0.1,scaleX:1.12,scaleY:1.12,x:0.2,y:30.4},0).wait(1).to({scaleX:1.09,scaleY:1.09},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({regX:0,regY:0,scaleX:1,scaleY:1,x:0,y:30.5},0).wait(19));

	// white 1
	instance_3 = this.instance_3 = new lib.WiFi_Green1("synched",0);
	instance_3.setTransform(-0.1,124.5,0.6,0.6,0,0,0,-0.1,0);
	instance_3.alpha = 0;

	this.timeline.addTween(Tween.get(instance_3).wait(1).to({scaleX:0.69,scaleY:0.69,x:0,alpha:0.191},0).wait(1).to({scaleX:1,scaleY:1,x:-0.1,alpha:0.811},0).wait(1).to({regX:0,scaleX:1.09,scaleY:1.09,x:0,alpha:1},0).wait(1).to({regX:-0.1,scaleX:1.08,scaleY:1.08,x:-0.1},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,scaleX:1,scaleY:1,x:0},0).wait(26));

	// black 4
	instance_4 = this.instance_4 = new lib.WiFi_Black4("synched",0);
	instance_4.setTransform(0,-109.9);

	this.timeline.addTween(Tween.get(instance_4).wait(34));

	// black 3
	instance_5 = this.instance_5 = new lib.WiFi_Black3("single",0);
	instance_5.setTransform(0,-39.8);

	this.timeline.addTween(Tween.get(instance_5).wait(34));

	// black 2
	instance_6 = this.instance_6 = new lib.WiFi_Black2("single",0);
	instance_6.setTransform(0,30.5);

	this.timeline.addTween(Tween.get(instance_6).wait(34));

	// black 1
	instance_7 = this.instance_7 = new lib.Wifi_Black1("single",0);
	instance_7.setTransform(0,124.5);

	this.timeline.addTween(Tween.get(instance_7).wait(34));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-222.9,-170,446,340);


(lib.LoaderDotsAni = function(mode,startPosition,loop) {
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// Layer 2
	instance = this.instance = new lib.LoaderDots("synched",0);
	instance.setTransform(-0.9,-1.9,1,1,0,0,0,59.9,158.5);

	this.timeline.addTween(Tween.get(instance).to({rotation:351.6},41).wait(1));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-113,-181.7,104,42.3);


(lib.Loader = function(mode,startPosition,loop) {
	var instance_1;
	var instance;
	this.initialize(mode,startPosition,loop,{});

	// unloaded
	instance = this.instance = new lib.Ring("single",1);
	instance.setTransform(0.9,0.5);
	instance.alpha = 0;

	this.timeline.addTween(Tween.get(instance).to({alpha:0.148},17).to({alpha:0},11).to({_off:true},1).wait(16));

	// loaded
	instance_1 = this.instance_1 = new lib.Ring("single",0);
	instance_1.setTransform(0.9,0.5);

	this.timeline.addTween(Tween.get(instance_1).wait(45));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(-246.4,-246.8,495.2,495.2);


(lib.EVTStartupMC = function(mode,startPosition,loop) {
	var shape;
	var ssid;
	var errorMessage;
	var instance_14;
	var instance_13;
	var instance_12;
	var instance_11;
	var instance_10;
	var instance_9;
	var instance_8;
	var instance_7;
	var instance_6;
	var instance_5;
	var scanCode;
	var instance_4;
	var nextCode;
	var openApp;
	var instance_3;
	var instance_2;
	var blueRing;
	var instance_1;
	var icons;
	var downloadDots;
	var instance;
	var powerWarning;
	this.initialize(mode,startPosition,loop,{jiboLogo:0,jiboLogo_stop:60,plugIn:61,plugIn_stop:79,pluggedIn:80,pluggedIn_stop:95,openApp:96,openApp_stop:108,openAppTap:109,openAppTap_stop:122,nextCode:123,nextCode_stop:135,nextCodeTap:136,nextCodeTap_stop:149,viewfinder:150,viewfinder_stop:160,viewfinderSpecific:161,viewfinderSpecific_stop:171,QRScan:172,QRScan_stop:214,wifiSearch:215,wifiSearch_stop:263,wifiSearchLoop:264,wifiSearchLoop_loop:328,wifiConnected:329,wifiConnected_stop:388,downloadStart:389,downloadStart_stop:446,downloading:447,downloadComplete:458,downloadComplete_stop:495,timeToReboot:496,timeToReboot_stop:659,wifiError:660,wifiError_stop:711});

	// powerWarning
	powerWarning = this.powerWarning = new lib.PowerWarning();
	powerWarning.setTransform(640,360,1,1,0,0,0,640,360);

	this.timeline.addTween(Tween.get(powerWarning).wait(713));

	// JiboLogo
	instance = this.instance = new lib.jiboLogo();
	instance.setTransform(640,360);
	instance._off = true;

	this.timeline.addTween(Tween.get(instance).wait(10).to({_off:false},0).to({_off:true},51).wait(652));

	// downloadDots
	downloadDots = this.downloadDots = new lib.LoaderDotsAni();
	downloadDots.setTransform(637.1,319.4,1.135,1.135);
	downloadDots.alpha = 0;
	downloadDots._off = true;

	this.timeline.addTween(Tween.get(downloadDots).wait(433).to({_off:false},0).to({alpha:1},14).wait(12).to({regX:-73.7,regY:-151.6,x:553.5,y:147.3,alpha:0.988},0).wait(1).to({alpha:0.949},0).wait(1).to({alpha:0.874},0).wait(1).to({alpha:0.754},0).wait(1).to({alpha:0.583},0).wait(1).to({alpha:0.382},0).wait(1).to({alpha:0.203},0).wait(1).to({alpha:0.082},0).wait(1).to({alpha:0.018},0).wait(1).to({regX:0,regY:0,x:637.1,y:319.4,alpha:0},0).to({_off:true},1).wait(244));

	// icons
	icons = this.icons = new lib.LoaderIconsText();
	icons.setTransform(640,320);
	icons._off = true;

	this.timeline.addTween(Tween.get(icons).wait(447).to({_off:false},0).wait(11).to({alpha:0},10).to({_off:true},1).wait(244));

	// Processing
	instance_1 = this.instance_1 = new lib.Ring("single",2);
	instance_1.setTransform(636.8,321.4);
	instance_1.alpha = 0;
	instance_1._off = true;

	this.timeline.addTween(Tween.get(instance_1).wait(458).to({_off:false},0).wait(1).to({regX:0.7,regY:0.5,scaleX:1,scaleY:1,x:637.5,y:321.9,alpha:0.012},0).wait(1).to({scaleX:1.01,scaleY:1.01,alpha:0.051},0).wait(1).to({scaleX:1.02,scaleY:1.02,alpha:0.126},0).wait(1).to({scaleX:1.04,scaleY:1.04,alpha:0.246},0).wait(1).to({scaleX:1.07,scaleY:1.07,alpha:0.417},0).wait(1).to({scaleX:1.1,scaleY:1.1,alpha:0.618},0).wait(1).to({scaleX:1.13,scaleY:1.13,alpha:0.797},0).wait(1).to({scaleX:1.15,scaleY:1.15,alpha:0.918},0).wait(1).to({scaleX:1.16,scaleY:1.16,alpha:0.982},0).wait(1).to({regX:0,regY:0,scaleX:1.16,scaleY:1.16,x:636.7,y:321.3,alpha:1},0).wait(1).to({regX:0.7,regY:0.5,scaleX:1.15,scaleY:1.15,x:637.5,y:321.9,alpha:0.993},0).wait(1).to({scaleX:1.13,scaleY:1.13,alpha:0.971},0).wait(1).to({scaleX:1.08,scaleY:1.08,alpha:0.931},0).wait(1).to({scaleX:1.01,scaleY:1.01,alpha:0.867},0).wait(1).to({scaleX:0.9,scaleY:0.9,alpha:0.776},0).wait(1).to({scaleX:0.77,scaleY:0.77,x:637.6,alpha:0.654},0).wait(1).to({scaleX:0.6,scaleY:0.6,alpha:0.507},0).wait(1).to({scaleX:0.42,scaleY:0.42,alpha:0.352},0).wait(1).to({scaleX:0.27,scaleY:0.27,x:637.7,alpha:0.215},0).wait(1).to({scaleX:0.15,scaleY:0.15,alpha:0.112},0).wait(1).to({scaleX:0.08,scaleY:0.08,alpha:0.046},0).wait(1).to({scaleX:0.04,scaleY:0.04,y:321.8,alpha:0.011},0).wait(1).to({regX:0,regY:0,scaleX:0.02,scaleY:0.02,y:321.9,alpha:0},0).to({_off:true},1).wait(231));

	// blueRing
	blueRing = this.blueRing = new lib.blueRing();
	blueRing.setTransform(636.8,321.4);
	blueRing._off = true;

	this.timeline.addTween(Tween.get(blueRing).wait(447).to({_off:false},0).wait(12).to({regX:1,regY:0.7,scaleX:1,scaleY:1,x:637.8,y:322.1},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1.04,scaleY:1.04},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.1,scaleY:1.1},0).wait(1).to({scaleX:1.13,scaleY:1.13},0).wait(1).to({scaleX:1.15,scaleY:1.15},0).wait(1).to({scaleX:1.16,scaleY:1.16},0).wait(1).to({regX:0,regY:0,scaleX:1.16,scaleY:1.16,x:636.7,y:321.3},0).wait(1).to({regX:1,regY:0.7,scaleX:1.15,scaleY:1.15,x:637.8,y:322.1,alpha:0.993},0).wait(1).to({scaleX:1.13,scaleY:1.13,alpha:0.971},0).wait(1).to({scaleX:1.08,scaleY:1.08,alpha:0.931},0).wait(1).to({scaleX:1.01,scaleY:1.01,alpha:0.867},0).wait(1).to({scaleX:0.9,scaleY:0.9,alpha:0.776},0).wait(1).to({scaleX:0.77,scaleY:0.77,y:322,alpha:0.654},0).wait(1).to({scaleX:0.6,scaleY:0.6,alpha:0.507},0).wait(1).to({scaleX:0.42,scaleY:0.42,x:637.7,alpha:0.352},0).wait(1).to({scaleX:0.27,scaleY:0.27,y:321.9,alpha:0.215},0).wait(1).to({scaleX:0.15,scaleY:0.15,alpha:0.112},0).wait(1).to({scaleX:0.08,scaleY:0.08,alpha:0.046},0).wait(1).to({scaleX:0.04,scaleY:0.04,y:321.8,alpha:0.011},0).wait(1).to({regX:0,regY:0,scaleX:0.02,scaleY:0.02,y:321.9,alpha:0},0).to({_off:true},1).wait(231));

	// loader
	instance_2 = this.instance_2 = new lib.Loader("synched",0);
	instance_2.setTransform(636,321,0.058,0.058);
	instance_2.alpha = 0.262;
	instance_2._off = true;

	this.timeline.addTween(Tween.get(instance_2).wait(389).to({_off:false},0).wait(1).to({regX:1.6,regY:0.9,scaleX:0.06,scaleY:0.06,x:636.1,alpha:0.265,startPosition:1},0).wait(1).to({scaleX:0.08,scaleY:0.08,alpha:0.274,startPosition:2},0).wait(1).to({scaleX:0.1,scaleY:0.1,y:321.1,alpha:0.29,startPosition:3},0).wait(1).to({scaleX:0.14,scaleY:0.14,x:636.2,alpha:0.315,startPosition:4},0).wait(1).to({scaleX:0.19,scaleY:0.19,x:636.3,alpha:0.35,startPosition:5},0).wait(1).to({scaleX:0.25,scaleY:0.25,x:636.4,y:321.2,alpha:0.397,startPosition:6},0).wait(1).to({scaleX:0.34,scaleY:0.34,x:636.5,y:321.3,alpha:0.457,startPosition:7},0).wait(1).to({scaleX:0.44,scaleY:0.44,x:636.7,y:321.4,alpha:0.529,startPosition:8},0).wait(1).to({scaleX:0.56,scaleY:0.56,x:636.9,y:321.5,alpha:0.612,startPosition:9},0).wait(1).to({scaleX:0.69,scaleY:0.69,x:637.1,y:321.6,alpha:0.7,startPosition:10},0).wait(1).to({scaleX:0.81,scaleY:0.81,x:637.3,y:321.7,alpha:0.784,startPosition:11},0).wait(1).to({scaleX:0.92,scaleY:0.92,x:637.4,y:321.8,alpha:0.857,startPosition:12},0).wait(1).to({scaleX:1,scaleY:1,x:637.6,y:321.9,alpha:0.913,startPosition:13},0).wait(1).to({scaleX:1.06,scaleY:1.06,x:637.7,alpha:0.954,startPosition:14},0).wait(1).to({scaleX:1.1,scaleY:1.1,y:322,alpha:0.981,startPosition:15},0).wait(1).to({scaleX:1.12,scaleY:1.12,x:637.8,alpha:0.996,startPosition:16},0).wait(1).to({regX:0,regY:0,scaleX:1.12,scaleY:1.12,x:636,y:321,alpha:1,startPosition:17},0).to({scaleX:0.94,scaleY:0.94,startPosition:28},11).wait(1).to({regX:1.6,regY:0.9,x:637.5,y:321.8,startPosition:29},0).wait(1).to({scaleX:0.95,scaleY:0.95,startPosition:30},0).wait(1).to({scaleX:0.95,scaleY:0.95,startPosition:31},0).wait(1).to({scaleX:0.95,scaleY:0.95,startPosition:32},0).wait(1).to({scaleX:0.96,scaleY:0.96,startPosition:33},0).wait(1).to({scaleX:0.96,scaleY:0.96,startPosition:34},0).wait(1).to({scaleX:0.97,scaleY:0.97,startPosition:35},0).wait(1).to({scaleX:0.97,scaleY:0.97,y:321.9,startPosition:36},0).wait(1).to({scaleX:0.98,scaleY:0.98,startPosition:37},0).wait(1).to({scaleX:0.99,scaleY:0.99,x:637.6,startPosition:38},0).wait(1).to({scaleX:0.99,scaleY:0.99,startPosition:39},0).wait(1).to({scaleX:0.99,scaleY:0.99,startPosition:40},0).wait(1).to({scaleX:1,scaleY:1,startPosition:41},0).wait(1).to({scaleX:1,scaleY:1,startPosition:42},0).wait(1).to({scaleX:1,scaleY:1,startPosition:43},0).wait(1).to({regX:0,regY:0,x:636,y:321,mode:"single",startPosition:44},0).to({_off:true},25).wait(255));

	// words
	instance_3 = this.instance_3 = new lib.Plugin_Text("synched",0);
	instance_3.setTransform(640,369.7);
	instance_3.alpha = 0;
	instance_3._off = true;

	openApp = this.openApp = new lib.OpenApp_Text();
	openApp.setTransform(640,360);
	openApp.alpha = 0;
	openApp._off = true;

	nextCode = this.nextCode = new lib.NextCode();
	nextCode.setTransform(640,360);
	nextCode.alpha = 0;
	nextCode._off = true;

	instance_4 = this.instance_4 = new lib.Viewfinder_Text("synched",0);
	instance_4.setTransform(640,640);
	instance_4.alpha = 0;
	instance_4._off = true;

	scanCode = this.scanCode = new lib.ViewfinderText_specific();
	scanCode.setTransform(640,640);
	scanCode.alpha = 0;
	scanCode._off = true;

	instance_5 = this.instance_5 = new lib.Glow();
	instance_5.setTransform(635.1,317.7,0.983,0.983,0,0,0,-10.3,6.5);
	instance_5.alpha = 0;
	instance_5._off = true;

	this.timeline.addTween(Tween.get(instance_3).wait(61).to({_off:false},0).to({y:370,alpha:1},12).wait(7).to({y:369.7},0).to({alpha:0},13).to({_off:true},3).wait(617));
	this.timeline.addTween(Tween.get(openApp).wait(96).to({_off:false},0).to({alpha:1},12).wait(1).to({alpha:0},13).to({_off:true},1).wait(590));
	this.timeline.addTween(Tween.get(nextCode).wait(123).to({_off:false},0).to({alpha:1},12).wait(1).to({alpha:0},13).to({_off:true},1).wait(563));
	this.timeline.addTween(Tween.get(instance_4).wait(150).to({_off:false},0).to({alpha:1},10).to({_off:true},1).wait(552));
	this.timeline.addTween(Tween.get(scanCode).wait(161).to({_off:false},0).to({alpha:1},10).to({_off:true},1).wait(541));
	this.timeline.addTween(Tween.get(instance_5).wait(458).to({_off:false},0).wait(1).to({regX:-7.9,regY:9.6,scaleX:0.99,scaleY:0.99,x:637.5,y:320.7,alpha:0.012},0).wait(1).to({scaleX:0.99,scaleY:0.99,y:320.9,alpha:0.051},0).wait(1).to({scaleX:1,scaleY:1,y:321.2,alpha:0.126},0).wait(1).to({scaleX:1.03,scaleY:1.03,x:637.6,y:321.8,alpha:0.246},0).wait(1).to({scaleX:1.06,scaleY:1.06,y:322.6,alpha:0.417},0).wait(1).to({scaleX:1.09,scaleY:1.09,x:637.7,y:323.5,alpha:0.618},0).wait(1).to({scaleX:1.12,scaleY:1.12,x:637.8,y:324.3,alpha:0.797},0).wait(1).to({scaleX:1.14,scaleY:1.14,y:324.8,alpha:0.918},0).wait(1).to({scaleX:1.16,scaleY:1.16,y:325.1,alpha:0.982},0).wait(1).to({regX:-10.4,regY:6.7,scaleX:1.16,scaleY:1.16,x:635,y:321.6,alpha:1},0).wait(1).to({regX:-7.9,regY:9.6,scaleX:1.15,scaleY:1.15,x:637.9,y:325,alpha:0.993},0).wait(1).to({scaleX:1.13,scaleY:1.13,x:637.8,y:324.9,alpha:0.971},0).wait(1).to({scaleX:1.08,scaleY:1.08,x:637.7,y:324.8,alpha:0.931},0).wait(1).to({scaleX:1.01,scaleY:1.01,x:637.5,y:324.5,alpha:0.867},0).wait(1).to({scaleX:0.91,scaleY:0.91,x:637.3,y:324.2,alpha:0.776},0).wait(1).to({scaleX:0.77,scaleY:0.77,x:636.9,y:323.8,alpha:0.654},0).wait(1).to({scaleX:0.61,scaleY:0.61,x:636.5,y:323.4,alpha:0.507},0).wait(1).to({scaleX:0.43,scaleY:0.43,x:636.1,y:322.9,alpha:0.352},0).wait(1).to({scaleX:0.28,scaleY:0.28,x:635.7,y:322.4,alpha:0.215},0).wait(1).to({scaleX:0.16,scaleY:0.16,x:635.4,y:322.1,alpha:0.112},0).wait(1).to({scaleX:0.09,scaleY:0.09,x:635.2,y:321.9,alpha:0.046},0).wait(1).to({scaleX:0.05,scaleY:0.05,x:635.1,y:321.7,alpha:0.011},0).wait(1).to({regX:-11,regY:6.9,scaleX:0.04,scaleY:0.04,x:635,y:321.6,alpha:0},0).to({_off:true},1).wait(231));

	// FlashAICB
	instance_6 = this.instance_6 = new lib.QRFlash("synched",0);
	instance_6.setTransform(631.9,342);
	instance_6._off = true;

	instance_7 = this.instance_7 = new lib.Wifi_Connecting("synched",0,false);
	instance_7.setTransform(641.3,260.1);

	instance_8 = this.instance_8 = new lib.Wifi_Connecting_Loop("synched",50);
	instance_8.setTransform(641.3,260.1);

	instance_9 = this.instance_9 = new lib.Wifi_Connected("single",33);
	instance_9.setTransform(641.3,260.1);
	instance_9._off = true;

	instance_10 = this.instance_10 = new lib.TimeToReboot_Text("synched",0);
	instance_10.setTransform(640,360);
	instance_10.alpha = 0;
	instance_10._off = true;

	instance_11 = this.instance_11 = new lib.ErrorIcon();
	instance_11.setTransform(640,170);

	this.timeline.addTween(Tween.get({}).to({state:[]}).to({state:[{t:instance_6}]},172).to({state:[{t:instance_6}]},14).to({state:[]},1).to({state:[{t:instance_7}]},28).to({state:[{t:instance_8}]},49).to({state:[{t:instance_9}]},65).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},12).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[{t:instance_9}]},1).to({state:[]},1).to({state:[{t:instance_10}]},109).to({state:[{t:instance_10}]},12).to({state:[{t:instance_10}]},134).to({state:[{t:instance_10}]},12).to({state:[]},1).to({state:[{t:instance_11}]},5).to({state:[]},11).to({state:[{t:instance_11}]},7).to({state:[]},13).to({state:[{t:instance_11}]},7).wait(15));
	this.timeline.addTween(Tween.get(instance_6).wait(172).to({_off:false},0).to({alpha:0},14,Ease.get(1)).to({_off:true},1).wait(526));
	this.timeline.addTween(Tween.get(instance_9).wait(329).to({_off:false},0).wait(1).to({regX:0.1,regY:0.2,scaleX:1.01,scaleY:1.01,x:641.4,y:260.3},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.12,scaleY:1.12},0).wait(1).to({regX:0,regY:0,scaleX:1.14,scaleY:1.14,x:641.3,y:260.1},0).wait(1).to({regX:0.1,regY:0.2,scaleX:1.13,scaleY:1.13,x:641.4,y:260.3},0).wait(1).to({scaleX:1.13,scaleY:1.13},0).wait(1).to({scaleX:1.12,scaleY:1.12},0).wait(1).to({scaleX:1.1,scaleY:1.1},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({scaleX:1.03,scaleY:1.03},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:0.98,scaleY:0.98},0).wait(1).to({scaleX:0.97,scaleY:0.97},0).wait(1).to({regX:0,regY:0,scaleX:0.97,scaleY:0.97,x:641.3,y:260.1},0).wait(1).to({regX:0.1,regY:0.2,x:641.4,y:260.3},0).wait(1).to({scaleX:0.97,scaleY:0.97},0).wait(1).to({scaleX:0.97,scaleY:0.97},0).wait(1).to({scaleX:0.98,scaleY:0.98},0).wait(1).to({scaleX:0.98,scaleY:0.98},0).wait(1).to({scaleX:0.99,scaleY:0.99},0).wait(1).to({scaleX:0.99,scaleY:0.99},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({regX:0,regY:0,scaleX:1,scaleY:1,x:641.3,y:260.1},0).wait(12).to({startPosition:33},0).wait(1).to({regX:0.1,regY:0.2,scaleX:1,scaleY:1,x:641.4,y:260.3},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1,scaleY:1},0).wait(1).to({scaleX:1.01,scaleY:1.01},0).wait(1).to({scaleX:1.02,scaleY:1.02},0).wait(1).to({scaleX:1.03,scaleY:1.03},0).wait(1).to({scaleX:1.05,scaleY:1.05},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.06,scaleY:1.06},0).wait(1).to({scaleX:1.07,scaleY:1.07},0).wait(1).to({regX:0,regY:0,scaleX:1.07,scaleY:1.07,x:641.3,y:260.1},0).wait(1).to({regX:0.1,regY:0.2,scaleX:1.06,scaleY:1.06,x:641.4,y:260.3,alpha:0.989},0).wait(1).to({scaleX:1.05,scaleY:1.05,alpha:0.958},0).wait(1).to({scaleX:1.01,scaleY:1.01,alpha:0.898},0).wait(1).to({scaleX:0.96,scaleY:0.96,alpha:0.792},0).wait(1).to({scaleX:0.86,scaleY:0.86,y:260.2,alpha:0.609},0).wait(1).to({scaleX:0.72,scaleY:0.72,x:641.3,alpha:0.357},0).wait(1).to({scaleX:0.62,scaleY:0.62,alpha:0.167},0).wait(1).to({scaleX:0.56,scaleY:0.56,alpha:0.066},0).wait(1).to({scaleX:0.54,scaleY:0.54,alpha:0.018},0).wait(1).to({regX:0,regY:0,scaleX:0.53,scaleY:0.53,y:260.1,alpha:0},0).to({_off:true},1).wait(326));
	this.timeline.addTween(Tween.get(instance_10).wait(496).to({_off:false},0).to({alpha:1},12).wait(134).to({startPosition:0},0).to({alpha:0},12).to({_off:true},1).wait(58));

	// Viewfinder (inner)
	instance_12 = this.instance_12 = new lib.QRCode("synched",0);
	instance_12.setTransform(633,343);
	instance_12._off = true;

	instance_13 = this.instance_13 = new lib.Wifi_Text("synched",0);
	instance_13.setTransform(640.8,541.4,0.8,0.8);
	instance_13.alpha = 0;
	instance_13._off = true;

	instance_14 = this.instance_14 = new lib.WiFi_Connected_Text("synched",0);
	instance_14.setTransform(629.4,557.5);
	instance_14.alpha = 0;
	instance_14._off = true;

	errorMessage = this.errorMessage = new lib.ErrorMessage();
	errorMessage.setTransform(640,360);
	errorMessage.alpha = 0;
	errorMessage._off = true;

	this.timeline.addTween(Tween.get(instance_12).wait(172).to({_off:false},0).wait(25).to({startPosition:0},0).to({scaleX:1.05,scaleY:1.05},6,Ease.get(1)).wait(1).to({regX:2,regY:5,scaleX:1.04,scaleY:1.04,x:635.1,y:348.2,alpha:0.981},0).wait(1).to({scaleX:1.02,scaleY:1.02,y:348.1,alpha:0.935},0).wait(1).to({scaleX:0.98,scaleY:0.98,x:635,y:347.9,alpha:0.854},0).wait(1).to({scaleX:0.92,scaleY:0.92,x:634.9,y:347.6,alpha:0.723},0).wait(1).to({scaleX:0.84,scaleY:0.84,x:634.7,y:347.2,alpha:0.537},0).wait(1).to({scaleX:0.75,scaleY:0.75,x:634.5,y:346.8,alpha:0.33},0).wait(1).to({scaleX:0.68,scaleY:0.68,x:634.4,y:346.4,alpha:0.168},0).wait(1).to({scaleX:0.63,scaleY:0.63,x:634.3,y:346.2,alpha:0.068},0).wait(1).to({scaleX:0.61,scaleY:0.61,x:634.2,y:346.1,alpha:0.017},0).wait(1).to({regX:0,regY:0,scaleX:0.6,scaleY:0.6,x:633,y:343,alpha:0},0).to({_off:true},1).wait(499));
	this.timeline.addTween(Tween.get(instance_13).wait(230).to({_off:false},0).to({scaleX:1,scaleY:1,alpha:1},13,Ease.get(1)).to({_off:true},86).wait(384));
	this.timeline.addTween(Tween.get(instance_14).wait(329).to({_off:false},0).wait(1).to({regX:-1.3,regY:-20.9,x:628.1,y:536.6,alpha:0.158},0).wait(1).to({alpha:0.749},0).wait(1).to({regX:0,regY:0,x:629.4,y:557.5,alpha:1},0).wait(44).to({startPosition:0},0).wait(1).to({regX:-1.3,regY:-20.9,x:628.1,y:536.6,alpha:0.992},0).wait(1).to({alpha:0.967},0).wait(1).to({alpha:0.919},0).wait(1).to({alpha:0.842},0).wait(1).to({alpha:0.73},0).wait(1).to({alpha:0.582},0).wait(1).to({alpha:0.411},0).wait(1).to({alpha:0.251},0).wait(1).to({alpha:0.129},0).wait(1).to({alpha:0.052},0).wait(1).to({alpha:0.012},0).wait(1).to({regX:0,regY:0,x:629.4,y:557.5,alpha:0},0).to({_off:true},1).wait(324));
	this.timeline.addTween(Tween.get(errorMessage).wait(660).to({_off:false},0).wait(1).to({regY:131,y:491,alpha:0.024},0).wait(1).to({alpha:0.11},0).wait(1).to({alpha:0.289},0).wait(1).to({alpha:0.565},0).wait(1).to({alpha:0.824},0).wait(1).to({alpha:0.963},0).wait(1).to({regY:0,y:360,alpha:1},0).wait(46));

	// ssid
	ssid = this.ssid = new lib.ssid();
	ssid.setTransform(636.1,617.9);
	ssid.alpha = 0;
	ssid._off = true;

	this.timeline.addTween(Tween.get(ssid).wait(215).to({_off:false},0).wait(19).to({alpha:1},10,Ease.get(1)).wait(136).to({regX:0.3,x:636.4,alpha:0.976},0).wait(1).to({alpha:0.89},0).wait(1).to({alpha:0.711},0).wait(1).to({alpha:0.435},0).wait(1).to({alpha:0.176},0).wait(1).to({alpha:0.037},0).wait(1).to({regX:0,x:636.1,alpha:0},0).to({_off:true},1).wait(326));

	// bg
	shape = this.shape = new Shape();
	shape.graphics.f("#000000").s().p("Ehj+A4QMAAAhweMDH+AAAMAAABweg");
	shape.setTransform(640,360);

	this.timeline.addTween(Tween.get(shape).wait(713));

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(0,0,1280,720);


// stage content:
(lib.setup = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

}).prototype = p = new MovieClip();
p.nominalBounds = new Rectangle(640,360,1280,720);

})(pixiflash_lib = pixiflash_lib||{}, pixiflash_images = pixiflash_images||{}, pixiflash = pixiflash||{}, ss = ss||{});
var pixiflash_lib, pixiflash_images, pixiflash, ss;