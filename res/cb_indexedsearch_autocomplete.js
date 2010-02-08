// Slightly modified jQuery plugin taken from http://www.dyve.net/jquery/?autocomplete

jQuery.indexedsearchAutocomplete = function(input, options) {
	// Create a link to self
	var me = this;

	// Create jQuery object for input element
	var $input = jQuery(input).attr("autocomplete", "off");;

	// Apply inputClass if necessary
	if (options.inputClass) $input.addClass(options.inputClass);

	// Create results
	var results = document.createElement("div");
	// Create jQuery object for results
	var $results = jQuery(results);
	// Set default values for results
	var pos = findPos(input);

	options.mustMatch = options.mustMatch || 0;
	
	$results.hide().addClass(options.resultsClass).css({
		position: "absolute",
		top: (pos.y + input.offsetHeight) + "px",
		left: pos.x + "px"
	});
	
	// Lets see if we can find it
	var readWidth = parseInt(jQuery("input[name='tx_indexedsearch[sword]']").get(0).clientWidth);
	if(readWidth > 0) {
		$results.css({
				width: readWidth + "px"
		});
	} 
	
	// Add to body element
	jQuery("body").append(results);

	input.autocompleter = me;
	input.lastSelected = $input.val();

	var timeout = null;
	var prev = "";
	var active = -1;
	var cache = {};
	var keyb = false;

	$input
	.keydown(function(e) {
		switch(e.keyCode) {
			case 38: // up
				e.preventDefault();
				moveSelect(-1);
				break;
			case 40: // down
				e.preventDefault();
				moveSelect(1);
				break;
			case 9:  // tab
			case 13: // return
				if (selectCurrent()) {
					e.preventDefault();
				}
				break;
			default:
				active = -1;
				if (timeout) clearTimeout(timeout);
				timeout = setTimeout(onChange, options.delay);
				break;
		}
	})
	.blur(function() {
		hideResults();
	});

	hideResultsNow();

	function onChange() {
		var v = $input.val();
		if (v == prev) return;
		prev = v;
		if (v.length >= options.minChars) {
			$input.addClass(options.loadingClass);
			requestData(v);
		} else {
			$input.removeClass(options.loadingClass);
			$results.hide();
		}
	};

 	function moveSelect(step) {

		var lis = jQuery("li", results);
		if (!lis) return;

		active += step;

		if (active < 0) {
			active = 0;
		} else if (active >= lis.size()) {
			active = lis.size() - 1;
		}

		lis.removeClass("over");

		jQuery(lis[active]).addClass("over");

		// Weird behaviour in IE
		// if (lis[active] && lis[active].scrollIntoView) {
		// 	lis[active].scrollIntoView(false);
		// }

	};

	function selectCurrent() {
		var li = jQuery("li.over", results)[0];
		if (!li) {
			var $li = jQuery("li", results);
			if (options.selectOnly) {
				if ($li.length == 1) li = $li[0];
			} else if (options.selectFirst) {
				li = $li[0];
			}
		}
		if (li) {
			selectItem(li);
			return true;
		} else {
			return false;
		}
	};

	function selectItem(li) {
		if (!li) {
			li = document.createElement("li");
			li.extra = [];
			li.selectValue = "";
		}
		var v = jQuery.trim(li.selectValue ? li.selectValue : li.innerHTML);
		input.lastSelected = v;
		prev = v;
		$results.html("");
		$input.val(v);
		hideResultsNow();
		setTimeout(function() { onItemSelect(li) }, 1);
	};

	function hideResults() {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(hideResultsNow, 200);
	};

	function hideResultsNow() {
		if (timeout) clearTimeout(timeout);
		$input.removeClass(options.loadingClass);
		if ($results.is(":visible")) {
			$results.hide();
		}
		if (options.mustMatch) {
			var v = $input.val();
			if (v != input.lastSelected) {
				selectItem(null);
			}
		}
	};

	function receiveData(q, data) {
		if (data) {
			$input.removeClass(options.loadingClass);
			results.innerHTML = "";
			if (jQuery.browser.msie) {
				// we put a styled iframe behind the calendar so HTML SELECT elements don't show through
				$results.append(document.createElement('iframe'));
			}
			results.appendChild(dataToDom(data));
			$results.show();
		} else {
			hideResultsNow();
		}
	};

	function parseData(data) {
		if (!data) return null;
		var parsed = [];
		var rows = data.split(options.lineSeparator);
		for (var i=0; i < rows.length; i++) {
			var row = jQuery.trim(rows[i]);
			if (row) {
				parsed[parsed.length] = row.split(options.cellSeparator);
			}
		}
		return parsed;
	};

	function dataToDom(data) {
		var ul = document.createElement("ul");
		var num = data.length;

		data.sort(function(a,b) {
			return parseInt(b[1]) - parseInt(a[1]);
		});

		for (var i=0; i < num; i++) {
			var row = data[i];
			if (!row) continue;

			if (typeof cb_indexsearch_autocomplete !== 'undefined' && typeof cb_indexsearch_autocomplete.maxResults !== 'undefined')
			{
				if (i >= cb_indexsearch_autocomplete.maxResults)
				{
					break;
				}
			}
			var li = document.createElement("li");
			li.innerHTML = formatItem(row, i, num);
			li.selectValue = row[0];
			var extra = null;
			if (row.length > 1) {
				extra = [];
				for (var j=1; j < row.length; j++) {
					extra[extra.length] = row[j];
				}
			}
			li.extra = extra;
			ul.appendChild(li);
			jQuery(li).hover(
				function() { jQuery("li", ul).removeClass("over"); jQuery(this).addClass("over"); },
				function() { jQuery(this).removeClass("over"); }
			).click(function(e) { e.preventDefault(); e.stopPropagation(); selectItem(this) });
		}
		return ul;
	};

	function requestData(q) {
		if (!options.matchCase) q = q.toLowerCase();
		var data = options.cacheLength ? loadFromCache(q) : null;
		if (data) {
			receiveData(q, data);
		} else {
			jQuery.get(makeUrl(q), function(data) {
				data = parseData(data)
				addToCache(q, data);
				receiveData(q, data);
			});
		}
	};

	function makeUrl(q) {
		var url = options.url + "&sw=" + q;
		for (var i in options.extraParams) {
			url += "&" + i + "=" + options.extraParams[i];
		}
		return url;
	};

	function loadFromCache(q) {
		if (!q) return null;
		if (cache[q]) return cache[q];
		if (options.matchSubset) {
			for (var i = q.length - 1; i >= options.minChars; i--) {
				var qs = q.substr(0, i);
				var c = cache[qs];
				if (c) {
					var csub = [];
					for (var j = 0; j < c.length; j++) {
						var x = c[j];
						var x0 = x[0];
						if (matchSubset(x0, q)) {
							csub[csub.length] = x;
						}
					}
					return csub;
				}
			}
		}
		return null;
	};

	function matchSubset(s, sub) {
		if (!options.matchCase) s = s.toLowerCase();
		var i = s.indexOf(sub);
		if (i == -1) return false;
		return i == 0 || options.matchContains;
	};

	this.flushCache = function() {
		cache = {};
	};

	this.setExtraParams = function(p) {
		options.extraParams = p;
	};

	function addToCache(q, data) {
		if (!data || !q || !options.cacheLength) return;
		if (!cache.length || cache.length > options.cacheLength) {
			cache = {};
			cache.length = 1; // we know we're adding something
		} else if (!cache[q]) {
			cache.length++;
		}
		cache[q] = data;
	};

	function findPos(obj) {
		var curleft = obj.offsetLeft || 0;
		var curtop = obj.offsetTop || 0;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
		return {x:curleft,y:curtop};
	}

	function onItemSelect(li) {	
		var thefield = $input;
		var theForm = thefield.parent();
		var i = 0;
		
		// Find the parent form, if not buried too deeply
		while(!theForm.is('FORM') && i < 20) {
			theForm = theForm.parent();
			i++;
		}
	
		if(theForm.is('FORM')) {
			var doAutoSubmit = typeof cb_indexsearch_autocomplete !== 'undefined' && typeof cb_indexsearch_autocomplete.autoSubmit !== 'undefined' && cb_indexsearch_autocomplete.autoSubmit;
			if (doAutoSubmit)
			{
				jQuery(theForm).get(0).submit();
			}
		}
	}
	
	function formatItem(row) {	
		var label = typeof cb_indexsearch_autocomplete !== 'undefined' && typeof cb_indexsearch_autocomplete.altResultsLabel !== 'undefined' ? cb_indexsearch_autocomplete.altResultsLabel : 'results';
		if(parseInt(row[1]) == 1) {
			label = typeof cb_indexsearch_autocomplete !== 'undefined' && typeof cb_indexsearch_autocomplete.altResultLabel !== 'undefined' ? cb_indexsearch_autocomplete.altResultLabel : 'result';
		}
		return row[0] + " (" + row[1] + " " + label + ")";
	}
}

jQuery.fn.indexedsearchAutocomplete = function(url, options) {
	// Make sure options exists
	options = options || {};
	// Set url as option
	options.url = url;
	// Set default values for required options
	options.inputClass = options.inputClass || "ac_input";
	options.resultsClass = options.resultsClass || "ac_results";
	options.lineSeparator = options.lineSeparator || "\n";
	options.cellSeparator = options.cellSeparator || "|";
	options.minChars = options.minChars || 1;
	options.delay = options.delay || 400;
	options.matchCase = options.matchCase || 0;
	options.matchSubset = options.matchSubset || 1;
	options.matchContains = options.matchContains || 0;
	options.cacheLength = options.cacheLength || 1;
	options.mustMatch = options.mustMatch || 0;
	options.extraParams = options.extraParams || {};
	options.loadingClass = options.loadingClass || "ac_loading";
	options.selectFirst = options.selectFirst || false;
	options.selectOnly = options.selectOnly || false;

	this.each(function() {
		var input = this;
		new jQuery.indexedsearchAutocomplete(input, options);
	});

	// Don't break the chain
	return this;
}

jQuery(document).ready(function() {
	jQuery("input[name='tx_indexedsearch[sword]']").indexedsearchAutocomplete("http://" + top.location.host + top.location.pathname + "?eID=cb_indexedsearch_autocomplete&sr=" + sr + "&sh=" + sh + "", { minChars:3, matchSubset:1, matchContains:1, cacheLength:10, selectOnly:1 });
});

