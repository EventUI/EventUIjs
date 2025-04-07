

$evui.init(function ()
{
    var BindingBenchmarkController = function ()
    {
        var _self = this;
        var _initialized = false;
        var _runButton = null;
        var _addButton = null;
        var _runLotsButton = null;
        var _appendButton = null;
        var _updateButton = null;
        var _clearButton = null;
        var _swapButton = null;
        var _rootElement = null;
        var _dataId = 0;

        /**
        @type {[]}*/
        this.data = [];

        /**
        @type {EVUI.Modules.Binding.Binding}*/
        this.selectedBinding = null;

        /**
        @type {EVUI.Modules.Binding.Binding}*/
        this.activeBinding = null;

        this.init = function ()
        {
            if (_initialized === true) return;
            _initialized = true;

            _runButton = document.getElementById("run");
            _addButton = document.getElementById("add");
            _runLotsButton = document.getElementById("runlots");
            _appendButton = document.getElementById("add");
            _updateButton = document.getElementById("update");
            _clearButton = document.getElementById("clear");
            _swapButton = document.getElementById("swaprows");
            _insertButton = document.getElementById("insert");
            _rootElement = document.getElementById("tbody");

            $evui.css(".select {background-color: blue}");

            $evui.binder.addHtmlContent({
                key: "tableRow",
                content: '<tr class="{{selected}}" onclick="{{clickHandler}}"><td>{{id}}</td><td><a>{{label}}</a></td><td><a class="remove">Remove</a></td><td></td></tr>'
            });

            hookUpButtons();
        };

        this.buildData = function (count)
        {
            var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
            var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
            var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

            var numAdj = adjectives.length;
            var numColors = colours.length;
            var numNouns = nouns.length;

            var data = [];
            for (var x = 0; x < count; x++)
            {
                data.push({
                    id: _dataId++,
                    label: adjectives[random(numAdj)] + " " + colours[random(numColors)] + " " + nouns[random(numNouns)],
                    selected: "",
                    clickHandler: clickHandler
                });
            }

            return data;
        };

        this.run = async function (maxData)
        {
            this.data = this.buildData(maxData); //this.data.concat(this.buildData(maxData));
            if (this.activeBinding != null)
            {
                this.activeBinding.dispose();
            }

            this.activeBinding = await $evui.bindAsync({ source: this.data, htmlContent: "tableRow", element: _rootElement,/* insertionMode: $evui.enum("BindingInsertionMode", "Append")*/ }); 
        };

        this.cleanUp = async function ()
        {
            if (this.activeBinding == null) return;

            this.activeBinding.dispose();
            this.activeBinding = null;
            this.data = [];
            this.selectedBinding = null;
        };

        this.append = async function (maxData)
        {
            if (this.activeBinding == null) return;

            this.data = this.data.concat(this.buildData(maxData));
            this.activeBinding.source = this.data;
            await this.activeBinding.updateAsync();
        };

        this.update = async function ()
        {
            if (this.activeBinding == null) return;
            for (var y = 0; y < this.data.length; y += 10)
            {
                this.data[y].label += "!!";
            }

            await this.activeBinding.updateAsync();
        };

        this.swap = async function ()
        {
            if (this.activeBinding == null) return;

            var temp = this.data[1];
            this.data[1] = this.data[998];
            this.data[998] = temp;

            await this.activeBinding.updateAsync();
        };

        this.insert = async function ()
        {
            if (this.activeBinding == null) return;

            this.data.splice(0, 0, this.buildData(1)[0]);

            await this.activeBinding.updateAsync();
        }

        var hookUpButtons = function ()
        {
            _runButton.onclick = async function ()
            {
                await timeStep("Create 1000 rows", async function ()
                {
                    await _self.run(1000);
                });
            };

            _appendButton.onclick = async function ()
            {
                await timeStep("Append 1000 rows to 10000 row table.", async function ()
                {
                    await _self.append(1000);
                });
            };

            _runLotsButton.onclick = async function ()
            {
                await timeStep("Create 10000 rows", async function ()
                {
                    await _self.run(10000);
                });
            };

            _updateButton.onclick = async function ()
            {
                await timeStep("Update every 10th row of 1000 rows", async function ()
                {
                    await _self.update(1000);
                });
            };

            _clearButton.onclick = async function ()
            {
                await timeStep("Clear existing content", function ()
                {
                    _self.cleanUp();
                })
            };

            _swapButton.onclick = async function ()
            {
                await timeStep("Swap content", async function ()
                {
                    await _self.swap();
                });
            };

            _insertButton.onclick = async function ()
            {
                await timeStep("Insert content", async function ()
                {
                    await _self.insert();
                });
            };
        };

        var timeStep = async function (detail, handler)
        {
            var now = Date.now();
            await handler();
            $evui.log(detail + " took " + (Date.now() - now) + "ms");
        };

        var clickHandler = async function (eventArgs, binding)
        {
            if ($evui.dom(eventArgs.srcElement).hasClass("remove") === true)
            {
                var now = Date.now();

                var index = _self.data.indexOf(binding.source);
                if (index > -1)
                {
                    if (_self.selectedBinding == binding) _self.selectedBinding = null;

                    _self.data.splice(index, 1);
                    await _self.activeBinding.updateAsync();
                }

                console.log("Remove: " + (Date.now() - now));
            }
            else
            {
                var now = Date.now();               

                if (_self.selectedBinding !== binding) //if our bindings are different, de-select the current one and re-select the new one
                {
                    binding.source.selected = "select";

                    if (_self.selectedBinding != null) //first selection, don't de-select
                    {
                        _self.selectedBinding.source.selected = "";
                    }

                    _self.selectedBinding = binding;
                }
                else
                {
                    binding.source.selected = "";
                    _self.selectedBinding = null;
                }

                await _self.activeBinding.updateAsync();

                console.log("Highlight: " + (Date.now() - now));
            }
        };

        var random = function (max)
        {
            return Math.round(Math.random() * 1000) % max;
        };
    };

    window.controller = new BindingBenchmarkController();
    window.controller.init();
});