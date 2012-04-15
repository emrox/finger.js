$(function(){
	new FingerJS;
});

/*********************************************************************
 References:
	https://github.com/colinbdclark/Flocking
**********************************************************************/

function FingerJS() {
	return this.init();
};

FingerJS.prototype.init = function() {
	this.fingerPadInit();
	return this;
};

FingerJS.prototype.fingerPadInit = function() {
	var fjsObj = this;

	$('.finger-pad').each(function(i, el){
		var $el = $(el);
		
		var posShower = $('<div class="finger-pos-shower"></div>');
		$el.data('posShower', posShower);
		$el.data('carrierId', i+1);
		
		var synth = flock.synth({
			id: fjsObj.fingerPadGetSynthModId("carrier", $el),
			ugen: "flock.ugen.sinOsc",
			freq: 200,
			mul: {
				id: fjsObj.fingerPadGetSynthModId("mod", $el),
				ugen: "flock.ugen.sinOsc",
				rate: "control",
				freq: 50.0
			}
		});
		$el.data('synth', synth);
		
		$el.append(posShower);
		
		$el.on('mousedown', function(ev) {
			FingerJS.normalizeEventOffset(ev);
			fjsObj.fingerPadStartSound($el, ev.offsetX, ev.offsetY);
		});
		$el.on('mouseup', function(ev) {
			fjsObj.fingerPadStopSound($el);
		});
		$el.on('mousemove', function(ev) {
			FingerJS.normalizeEventOffset(ev);
			fjsObj.fingerPadMoveCursor($el, ev.offsetX, ev.offsetY);
		});
	});
};

FingerJS.prototype.fingerPadStartSound = function($el, x, y) {
	var fjsObj 		= this;
	var elOffset	= $el.offset();
	
	fjsObj.fingerPadAdjustMarkerPos($el, x, y);
	$el.css({opacity: 0.8});
	// disabled ATM due to a little bug: $el.data('posShower').show();
	
	$el.data('synth').play();
};

FingerJS.prototype.fingerPadAdjustMarkerPos = function($el, x, y) {
	var elOffset = $el.offset();
	$el.data('posShower').css({ top: elOffset.top + y - 10, left: elOffset.left + x - 10})
};

FingerJS.prototype.fingerPadStopSound = function($el) {
	$el.data('posShower').hide();
	$el.css({opacity: 1});

	$el.data('synth').pause();
};

FingerJS.prototype.fingerPadGetPlayFreq = function($el, x, y) {
	var elWidth = $el.width();
	
	var freqStart	= 200;
	var freqEnd		= 2200;
	var freqSpan	= freqEnd - freqStart;
	
	return freqStart + (freqSpan / elWidth * x);
};

FingerJS.prototype.fingerPadGetSynthModId = function(synthName, $el) {
	return synthName+"_"+$el.data('carrierId')
}

FingerJS.prototype.fingerPadMoveCursor = function($el, x, y) {
	var fjsObj 		= this;
	
	fjsObj.fingerPadAdjustMarkerPos($el, x, y);
	
	var elWidth		= $el.width();
	var playFreqLow	= 200;
	var playFreqHigh= 2200;
	var playFreqSpan= playFreqHigh - playFreqLow;
	var playFreqPlay= playFreqLow + (playFreqSpan / elWidth * x);
	
	var elHeight	= $el.height();
	var modFreqLow	= 0.1;
	var modFreqHigh	= 60;
	var modFreqSpan	= modFreqHigh - modFreqLow;
	var modFreqPlay	= modFreqHigh - (modFreqSpan / elHeight * y);	
	
	$el.data('synth').input(fjsObj.fingerPadGetSynthModId('carrier',$el) + ".freq", playFreqPlay);
	$el.data('synth').input(fjsObj.fingerPadGetSynthModId('mod', $el) + ".freq", modFreqPlay);
}

/**
 * Normalizes the event offsetX/offsetY properties across browsers, particularly for Firefox, which doesn't natively support them.
 */
FingerJS.normalizeEventOffset = function(ev) {
	if (ev.offsetX === undefined) {
		var offset = $(ev.target).offset();
		ev.offsetX = ev.clientX - offset.left;
		ev.offsetY = ev.clientY - offset.top;
	}
	return ev;
};

