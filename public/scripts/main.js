(function() {
    "use strict";

    // Bootstrap
    window.addEventListener('load', function(e) {
        initHeader();
        initContent();
        addListeners();
        initWebSocket();
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 1);
    }, false);

    // Declaration & Initializing
    var width, height, hideLangageList, largeHeader, language, oContent, aContactItems, oGlassContent, skipper, oHeaderBar, aImgItems, canvas, ctx, circles, target, animateHeader = true,
        isBgrAnimating = false,
        isSkipperAnimating = false,
        iCurrentBgr = 0,
        bgrInterval, noscroll = true,
        isRevealed = false,
        aAnimIn, t,
        map, pointarray, heatmap,
        infoWindows = [],
        oCounter, cnt = 0;

    // Event handling
    function addListeners() {
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', scroll);
        skipper.addEventListener('click', function() {
            toggle(1);
        });
        oHeaderBar.addEventListener('click', function() {
            toggle();
        });
        if (!language) return;
        for (var i = 0; i < language.children.length; i++) {
            language.children[i].addEventListener('click', function(e) {
                if (e.currentTarget.nodeName === 'A') {
                    languageDialog();
                } else {
                    selectLanguage(e);
                }
            });
        }
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {
            x: 0,
            y: height
        };

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height + 'px';

        canvas = document.getElementById('header-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create particles
        circles = [];
        var numberCircles = 100; //width * 0.5;
        for (var x = 0; x < numberCircles; x++) {
            var c = new Circle();
            circles.push(c);
        }
        limitLoop(animateHeaderCanvas, 60);

        aImgItems = document.querySelector('ul.image-wrap').children;
        bgrInterval = setInterval(animateBackgroundTransition, 5000);

        aContactItems = document.querySelectorAll('.btn-wrapper');

        var i = 0;
        var timeoutAnimation = function() {
            setTimeout(function() {
                if (aContactItems.length == 0) return;
                aContactItems[i].className = aContactItems[i].className + ' fxFlipInX';
                i++;
                if (i < aContactItems.length) timeoutAnimation();
            }, 100);
        }

        disable_scroll();
        timeoutAnimation();
    }

    function initWebSocket() {
        // var socket = io('localhost:3000');

        // socket.on('newCamera', function(data){
        //     console.log(data);

        //     var image = 'img/mapcamNew.svg';
        //     addCamMarker(data, image, true);
        // });
    }

    function initContent() {
        oContent = document.getElementById('content');
        oHeaderBar = document.querySelector('header');
        oGlassContent = document.querySelector("#glass-content");
        oCounter = document.querySelector(".number");
        skipper = document.querySelector("#header-skipper");
        aAnimIn = document.querySelectorAll('.animation-init');
        language = document.getElementById('language-setting');

        oContent.style.height = window.innerHeight + 'px';
        oContent.height = window.innerHeight + 'px';

        // INIT THE CHART
        /* Set some base options (settings will override the default settings in Chartist.js *see default settings*). We are adding a basic label interpolation function for the xAxis labels. */
        var options = {
            axisX: {
                labelInterpolationFnc: function(value) {
                    return 'Time ' + value;
                }
            },
            low: 0,
            high: 300
        };

        /* Initialize the chart with the above settings */
        var chart = new Chartist.Line('#x-chart', {labels:[],series:[]}, options);

        // Create AJAX request
        window.setInterval(function() {
            var r = new XMLHttpRequest();
            r.open("GET", "/orders/recent", true);
            r.onreadystatechange = function() {
                if (r.readyState != 4 || r.status != 200) return;

                // console.log(JSON.parse(r.response));

                var labels = new Array();
                var series = new Array();
                var iterate = 0;

                var map = _.chain(JSON.parse(r.response))
                    .groupBy('carrier')
                    .mapObject(function(val, key) {
                        var output = {
                            data: val.map(function(obj) {
                                if (iterate === 0) {
                                    labels.push('' + obj.period);
                                };
                                return obj.price
                            }).reverse(),
                            key: key
                        };
                        iterate++;
                        series.push(output);
                        return output;
                    })
                    .value();

                var data = {
                    labels: labels,
                    series: _.sortBy(series, 'key')
                };

                // console.log(labels);
                console.log(data);

                // UPDATE THE CHART
                chart.update(data);
            };
            r.send();
        }, 1000);

    }

    function closeAllInfoWindows() {
        for (var i = 0; i < infoWindows.length; i++) {
            infoWindows[i].close();
        }
    }

    function disable_scroll() {
        var preventDefault = function(e) {
            e = e || window.event;
            if (e.preventDefault)
                e.preventDefault();
            e.returnValue = false;
        };
        document.body.ontouchmove = function(e) {
            preventDefault(e);
        };
    }

    function enable_scroll() {
        window.onmousewheel = document.onmousewheel = document.onkeydown = document.body.ontouchmove = null;
    }

    function scroll() {
        // Update Glass header
        // var iOffset = window.pageYOffset;
        // if (oGlassContent) oGlassContent.style.marginTop = (iOffset * -1) + 'px';

        // Upate Large Header
        var scrollVal = window.pageYOffset || largeHeader.scrollTop;
        if (noscroll) {
            if (scrollVal < 0) return false;
            window.scrollTo(0, 0);
        }
        if (isSkipperAnimating) {
            return false;
        }
        if (scrollVal <= 0 && isRevealed) {
            toggle(0);
        } else if (scrollVal > 0 && !isRevealed) {
            toggle(1);
        }

        // Animate Sections
        for (var i = 0; i < aAnimIn.length; i++) {
            var animationElement = aAnimIn[i];

            var docViewTop = window.pageYOffset;
            var docViewBottom = docViewTop + window.innerHeight;

            var elemTop = animationElement.offsetTop;
            // var elemBottom = elemTop + animationElement.offsetHeight;

            if (elemTop <= docViewBottom - animationElement.offsetHeight / 3) {
                if (animationElement.classList.contains('animate-in') == false) {
                    animationElement.className = animationElement.className + ' animate-in';
                }
            }
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;

        oContent.style.height = height + 'px';
        oContent.height = height + 'px';
    }

    function toggle(reveal) {
        isSkipperAnimating = true;

        if (reveal) {
            document.body.className = 'revealed';
        } else {
            animateHeader = true;
            noscroll = true;
            disable_scroll();
            document.body.className = '';
            // Reset animated content
            for (var i = 0; i < aAnimIn.length; i++) {
                var animationElement = aAnimIn[i];
                animationElement.className = animationElement.className.replace(' animate-in', '');
            }
        }

        // simulating the end of the transition:
        setTimeout(function() {
            isRevealed = !isRevealed;
            isSkipperAnimating = false;
            if (reveal) {
                animateHeader = false;
                noscroll = false;
                enable_scroll();
            }
        }, 1200);
    }

    function animateBackgroundTransition(dir) {
        if (isBgrAnimating) return false;
        isBgrAnimating = true;
        var cntAnims = 0;
        var itemsCount = aImgItems.length;
        dir = dir || 'next';

        var currentItem = aImgItems[iCurrentBgr];
        if (dir === 'next') {
            iCurrentBgr = (iCurrentBgr + 1) % itemsCount;
        } else if (dir === 'prev') {
            iCurrentBgr = (iCurrentBgr - 1) % itemsCount;
        }
        var nextItem = aImgItems[iCurrentBgr];

        var classAnimIn = dir === 'next' ? 'navInNext' : 'navInPrev'
        var classAnimOut = dir === 'next' ? 'navOutNext' : 'navOutPrev';

        var onEndAnimationCurrentItem = function() {
            currentItem.className = '';
            ++cntAnims;
            if (cntAnims === 2) {
                isBgrAnimating = false;
            }
        }

        var onEndAnimationNextItem = function() {
            nextItem.className = 'current';
            ++cntAnims;
            if (cntAnims === 2) {
                isBgrAnimating = false;
            }
        }

        setTimeout(onEndAnimationCurrentItem, 2000);
        setTimeout(onEndAnimationNextItem, 2000);

        currentItem.className = currentItem.className + ' ' + classAnimOut;
        nextItem.className = nextItem.className + classAnimIn;
    }

    var animateHeaderCanvas = function() {
        if (animateHeader) {
            ctx.clearRect(0, 0, width, height);
            for (var i in circles) {
                circles[i].draw();
            }
        }
    }

    var limitLoop = function(fn, fps) {

        // Use var then = Date.now(); if you
        // don't care about targetting < IE9
        var then = new Date().getTime();

        // custom fps, otherwise fallback to 60
        fps = fps || 60;
        var interval = 1000 / fps;

        return (function loop(time) {
            requestAnimationFrame(loop);

            // again, Date.now() if it's available
            var now = new Date().getTime();
            var delta = now - then;

            if (delta > interval) {
                // Update time
                // now - (delta % interval) is an improvement over just 
                // using then = now, which can end up lowering overall fps
                then = now - (delta % interval);

                // call the fn
                fn();
            }
        }(0));
    };

    // Canvas manipulation
    function Circle() {
        var _this = this;

        // constructor
        (function() {
            _this.pos = {};
            init();
        })();

        function init() {
            _this.pos.x = Math.random() * width;
            _this.pos.y = height + Math.random() * 100;
            _this.alpha = 0.1 + Math.random() * 0.3;
            _this.scale = 0.1 + Math.random() * 0.3;
            _this.velocity = Math.random();
        }

        this.draw = function() {
            if (_this.alpha <= 0) {
                init();
            }
            _this.pos.y -= _this.velocity;
            _this.alpha -= 0.0005;
            ctx.beginPath();
            ctx.arc(_this.pos.x, _this.pos.y, _this.scale * 10, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,' + _this.alpha + ')';
            ctx.fill();
        };
    }
})();
