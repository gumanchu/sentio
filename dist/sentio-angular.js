/*! sentio Version: 0.1.0 */
angular.module('sentio.realtime', []);
angular.module('sentio.realtime').directive('sentioRtTimeline', function($document, $window, $timeout, $log) {
	'use strict';

	return {
		restrict : 'A',
		scope : {
			model: '=sentioModel',
			interval: '=sentioInterval',
			delay: '=sentioDelay',
			yExtent: '=sentioYExtent',
			duration: '=sentioDuration',
			efficient: '=sentioEfficient',
			resizeWidth: '@sentioResizeWidth',
			resizeHeight: '@sentioResizeHeight',
			configure: '&sentioConfigureFn'
		},
		replace : false,
		link : function(scope, element, attrs, controller) {
			var timelineElement = d3.select(element[0]);
			var timeline = sentio.realtime.timeline();

			timeline.init(timelineElement);

			scope.$watch('configure', function(n, o){
				if(null != scope.configure){
					scope.configure({ timeline: timeline });
				}
			});

			scope.$watchCollection('model', function(n, o){
				if(null == o && null == n){ return; }

				timeline.data(n).redraw();
				timeline.start();
			});

			scope.$watch('interval', function(n, o){
				if(null == o && null == n){ return; }

				timeline.interval(n).redraw();
			});

			scope.$watch('delay', function(n, o){
				if(null == o && null == n){ return; }

				timeline.delay(n).redraw();
			});

			scope.$watchCollection('yExtent', function(n, o){
				if(null == o && null == n){ return; }

				timeline.yExtent(n).redraw();
			});

			scope.$watch('duration', function(n, o){
				if(null == o && null == n){ return; }

				timeline.duration(n);
			}, true);

			scope.$watch('efficient', function(n, o){
				if(null == o && null == n){ return; }

				timeline.efficient(n);
			}, true);

			// Manage resizing the chart
			var resizeWidth = (null != attrs.sentioResizeWidth);
			var resizeHeight = (null != attrs.sentioResizeHeight);
			var resizeTimer;
			var window = angular.element($window);

			var doResize = function() {

				// Get the raw body element
				var body = $document[0].body;

				// Cache the old overflow style
				var overflow = body.style.overflow;
				body.style.overflow = 'hidden';

				// Get the raw parent
				var rawElement = element[0];
				// Derive height/width of the parent (there are several ways to do this depending on the parent)
				var parentWidth = rawElement.attributes.width | rawElement.style.width | rawElement.clientWidth;
				var parentHeight = rawElement.attributes.height | rawElement.style.height | rawElement.clientHeight;

				// Calculate the new width/height based on the parent and the resize size
				var width = (resizeWidth)? parentWidth - attrs.sentioResizeWidth : undefined;
				var height = (resizeHeight)? parentHeight - attrs.sentioResizeHeight : undefined;

				// Reapply the old overflow setting
				body.style.overflow = overflow;

				console.log('resize rt.timeline height: ' + height + ' width: ' + width);

				// Apply the new width and height
				if(resizeWidth){ timeline.width(width); }
				if(resizeHeight){ timeline.height(height); }

				timeline.redraw();
			};
			var delayResize = function(){
				if(undefined !== resizeTimer){
					$timeout.cancel(resizeTimer);
				}
				resizeTimer = $timeout(doResize, 200);
			};

			if(resizeWidth || resizeHeight){
				window.on('resize', delayResize);
				delayResize();
			}
			scope.$on('$destroy', function () {
				window.off('resize', delayResize);
			});
		}
	};
});
