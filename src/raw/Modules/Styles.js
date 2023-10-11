/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Styles|Styles)#*/
/*#REPLACE(EVUI.Modules.Styles|Styles)#*/

/**Module for building and manipulating stylesheets at runtime without resorting to injecting a string of CSS into a style tag.
@module*/
EVUI.Modules.Styles = {};

/*#MODULEDEF(Styles|"1.0";|"Styles")#*/
/*#VERSIONCHECK(EVUI.Modules.Styles|Styles)#*/

EVUI.Modules.Styles.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Styles.Dependencies, "checked",
        {
            get: function () { return checked; },
            set: function (value)
            {
                if (typeof value === "boolean") checked = value;
            },
            configurable: false,
            enumberable: true
        });
})();

Object.freeze(EVUI.Modules.Styles.Dependencies);

EVUI.Modules.Styles.Constants = {};
EVUI.Modules.Styles.Constants.DefaultStyleSheetName = "evui-style-default";

/**Utility for programmatically manipulating stylesheets.
@class*/
EVUI.Modules.Styles.StyleSheetManager = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Styles.Dependencies);

    //instance of the style parser used to parse raw CSS into a JSON object that can more easily be digested.
    var _parser = new EVUI.Modules.Styles.StyleParser();

    //keywords defining sets of rules that need to stay aggregated together in order to be applied properly
    var _aggregationSets = ["@keyframes"];

    /**Internal list of StylesheetEntry objects representing programmatically added stylesheets.
    @type {StylesheetEntry[]}*/
    var _stylesheets = [];

    /**Creates and/or adds a stylesheet to the internal list of managed stylesheets and adds it and the provided rules to the DOM..
    @param {String} sheetName The name used to identify the stylesheet.
    @param {EVUI.Modules.Styles.StyleSheetRule[]|EVUI.Modules.Styles.StyleSheetRule|String|CSSStyleSheet} rules Either an array of YOLO StyleSheetRules, or a single YOLO StyleSheetRule, any string of valid CSS, or a pre-existing CSSStyleSheet object.
    @returns {Boolean}*/
    this.addStyleSheet = function (sheetName, rules)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");

        var existing = getStylesheetEntry(sheetName);
        if (existing === true) throw Error("A stylesheet with the name \"" + sheetName + " already exists.");

        var isExistingSheet = rules instanceof CSSStyleSheet;

        var flatRules = processRules(rules, true);

        var styleSheet = null;
        if (isExistingSheet === false)
        {
            styleSheet = makeStyleSheetElement().sheet;
        }
        else
        {
            styleSheet = rules;

        }

        var entry = new StyleSheetEntry();
        entry.lock = (rules.lock === true) ? true : false;
        entry.name = sheetName;
        entry.styleSheet = styleSheet;

        _stylesheets.push(entry);

        if (isExistingSheet === false)
        {
            if (flatRules == null) return true;
            applyRulesList(entry, flatRules.slice());
        }
        else
        {
            entry.rules = flatRules;
            ensureSheetInDom(entry);
        }  

        return translateRuleEntries(entry.rules);
    };

    /**Removes a style sheet (and all of its rules) from the page.
    @param {String} sheetName The name of the sheet to remove.
    @returns {Boolean}*/
    this.removeStyleSheet = function (sheetName)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");

        var existing = getStylesheetEntry(sheetName);
        if (existing == null || existing.lock === true) return false;        

        var index = _stylesheets.indexOf(existing);
        if (index !== -1) _stylesheets.splice(index, 1);

        if (existing.styleSheet.ownerNode != null) existing.styleSheet.ownerNode.remove();
        return true;
    };

    /**Sets or adds CSS rules. To remove a rule from a selector, set its value to a string of "null", i.e. " h1{display: null}" to remove the display property from a style applying to h1.
    Note that selectors for rules nested in at-rules are accessed by their "flat" path name, i.e. the style block inside of @page { @media (condition) { h1 { display: none; }}} would be accessed via "@page @media (condition) h1".
    @param {String} sheetName The name of the sheet to change the CSS rules of. If the sheet with the name does not already exist, one is created.
    @param {EVUI.Modules.Styles.StyleSheetRule[]|EVUI.Modules.Styles.StyleSheetRule|String|String[]|CSSStyleSheet} selectorOrRules Either a "flat" CSS selector or an array of "flat" CSS selectors, an array of YOLO StyleSheetRules, or a single YOLO StyleSheetRule, any string of valid CSS, or a pre-existing CSSStyleSheet object.
    @param {String|Object} rules If the previous parameter was a selector, these are the rules to apply to the selector, either as a CSS string of rules applied to a single selector or an object with camel-cased property names that correspond to CSS property names.
    @returns {EVUI.Modules.Styles.StyleSheetRule[]}*/
    this.setRules = function (sheetName, selectorOrRules, rules)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");
        var ambiguousRules = null;

        if (typeof rules === "string" || (rules != null && typeof rules === "object"))
        {
            if (typeof selectorOrRules !== "string" && EVUI.Modules.Core.Utils.isArray(selectorOrRules) === false) throw Error("Invalid input. Selector missing for provided rules string or an array of strings.");

            ambiguousRules = new EVUI.Modules.Styles.StyleSheetRule();
            ambiguousRules.selector = selectorOrRules;
            ambiguousRules.rules = rules; //this can either be an object or a string, the code below can handle either case
        }
        else
        {
            ambiguousRules = selectorOrRules;
        }

        var existing = getStylesheetEntry(sheetName);
        if (existing == null)
        {
            this.addStyleSheet(sheetName, ambiguousRules);
            return;
        }

        //figure out what to do with the ambiguous rules and turn them into a flat list of selector and rule objects representing all our new or changed rules
        var newRules = processRules(ambiguousRules);
        var numNewRules = newRules.length;
        var rulesToAdd = [];
        var addedRules = [];

        for (var x = 0; x < numNewRules; x++)
        {
            var curNewRule = newRules[x];

            var curExisting = getExistingRule(existing, curNewRule.selector);
            if (curExisting != null) //the rule is an existing rule, we go update the existing rule in the CSS
            {
                //merge the new rules onto the old rules
                var merged = {};
                var flat = null;
                if (curExisting.selectors.filter(function (selector) { return isAggregatedNonCascadingSet(selector) }).length > 0) //if we have an aggregated rule that does not cascade, don't merge and flatten it
                {
                    merged = curNewRule.rules;
                    flat = [curNewRule];
                }
                else //otherwise, flatten and merge it
                {
                    merged[curExisting.selector] = merge(curNewRule.rules, curExisting.rules);
                    flat = makeFlatRulesList(merged);
                }

                var index = getCssRuleIndex(existing, curExisting); //see if we still have the rule on the css object
                if (index === -1 && flat.length > 0)
                {
                    rulesToAdd.push(curNewRule); //we do not, add it
                }
                else //we do, go remove the old rule and re-add the new rule.
                {
                    var updated = updateRules(flat, index, existing, curExisting);
                    if (updated != null) addedRules = addedRules.concat(updated);
                }
            }
            else //not an existing rule, add it
            {
                //make sure the rule isn't all "nulls" - this is an edge case that can break the stylesheet manager or crash outright
                var keys = Object.keys(curNewRule.rules);
                var numKeys = keys.length;
                var allNulls = true;

                for (var y = 0; y < numKeys; y++)
                {
                    if (curNewRule.rules[keys[y]] !== "null") //null is the magic key that means "get rid of this rule"
                    {
                        allNulls = false;
                        break;
                    }
                }

                if (allNulls === true) continue;
                rulesToAdd.push(curNewRule);
            }
        }

        //add all the new rules and we are done
        var added = applyRulesList(existing, rulesToAdd);
        return translateRuleEntries(addedRules.concat(added));
    };

    /**Removes all CSS rules from the sheet with the given name that match the provided selectors.
    Note that selectors for rules nested in at-rules are accessed by their "flat" path name, i.e. the style block inside of @page { @media (condition) { h1 { display: none; }}} would be accessed via "@page @media (condition) h1".
    @param {String} sheetName The name given to the StyleSheetManager of the sheet to remove the rules from.
    @param {String|String[]} selector The "flat" selector or array of selectors of the rules to remove.
    @returns {EVUI.Modules.Styles.StyleSheetRule[]} */
    this.removeRules = function (sheetName, selector)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");
        var existingSheet = getStylesheetEntry(sheetName);        

        if (existingSheet == null) return false;

        var selectors = getSelectors(selector);
        var numSelectors = selectors.length;
        var removed = [];

        for (var x = 0; x < numSelectors; x++)
        {
            var curSelector = selectors[x];
            var existing = getExistingRule(existingSheet, curSelector);
            if (existing != null)
            {
                var index = getCssRuleIndex(existingSheet, existing);
                if (index !== -1)
                {
                    existingSheet.styleSheet.deleteRule(index);

                    var ruleIndex = existingSheet.rules.indexOf(existing);
                    if (ruleIndex !== -1) existingSheet.rules.splice(ruleIndex, 1);

                    removed.push(existing);
                }
            }
        }

        return translateRuleEntries(removed);
    };

    /**Gets all the rules from a managed style sheet entry, or gets all the rules from a managed style sheet entry with the given selector(s).
    Note that selectors for rules nested in at-rules are accessed by their "flat" path name, i.e. the style block inside of @page { @media (condition) { h1 { display: none; }}} would be accessed via "@page @media (condition) h1".
    @param {String} sheetName The name given to the StyleSheetManager of the sheet to get the rules from.
    @param {String|String[]} selector The "flat" selector or array of selectors of the rules to get.
    @returns {EVUI.Modules.Styles.StyleSheetRule[]} */
    this.getRules = function (sheetName, selector)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");

        var existingSheet = getStylesheetEntry(sheetName);
        if (existingSheet == null) return null;

        if (typeof selector === "string" || EVUI.Modules.Core.Utils.isArray(selector))
        {
            var selectors = getSelectors(selector);
            var numSelectors = selectors.length;

            var matches = [];
            for (var x = 0; x < numSelectors; x++)
            {
                var curSelector = selectors[x];

                var existing = getExistingRule(existingSheet, curSelector);
                if (existing != null)
                {
                    matches.push(existing);
                }
            }

            return translateRuleEntries(matches);
        }
        else
        {
            return translateRuleEntries(existingSheet.rules);
        }

        return rules;
    };

    /**Ensures that a style sheet being managed will be active in the DOM with all of its rules intact. If the sheet has been removed from the DOM, it is cloned from its latest state and re-inserted.
    @param {String} sheetName The name of the style sheet given to the StyleSheetManager of the sheet to restore.
    @param {EVUI.Modules.Styles.StyleSheetRule[]|EVUI.Modules.Styles.StyleSheetRule|String|String[]|CSSStyleSheet} existingSheet If the sheet does not exist, these are the rules to use when creating the sheet. The rules can be a YOLO StyleSheetRule, an array of YOLO StyleSheetRules, a string of CSS or an array of strings of CSS, or a pre-existing CSS style sheet.
    @returns {EVUI.Modules.Styles.StyleSheetRule[]}*/
    this.ensureSheet = function (sheetName, existingSheet)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");

        var sheetEntry = getStylesheetEntry(sheetName);
        if (sheetEntry == null)
        {
            return this.addStyleSheet(sheetName, existingSheet);
        }

        ensureSheetInDom(sheetEntry);

        return this.getRules(sheetName);
    };

    /**Syncs the contents of the DOM with the in-memory set of rules in the StyleSheetManager or vice-versa.
    @param {String} sheetName The name of the style sheet given to the StyleSheetManager of the sheet to sync.
    @param {String} syncMode The value from the SyncMode enum indicating which way to sync. Can either sync the DOM onto the in-memory copy, or reset the DOM to match the in-memory copy (default).
    @returns {EVUI.Modules.Styles.StyleSheetRule[]}*/
    this.sync = function (sheetName, syncMode)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sheetName) === true) throw new Error("Sheet name cannot be null or whitespace.");

        if (typeof syncMode !== "string") return false;

        var existingSheet = getStylesheetEntry(sheetName);
        if (existingSheet == null) return false;

        if (syncMode === EVUI.Modules.Styles.SyncMode.FromSheet)
        {
            if (existingSheet.lock === true) throw Error("Cannot sync the contents of a locked sheet with those of the DOM.");

            existingSheet.rules = processExistingSheet(existingSheet);
            return translateRuleEntries(existingSheet.rules);
        }
        else
        {
            while (existingSheet.styleSheet.cssRules.length > 0)
            {
                existingSheet.styleSheet.deleteRule(0);
            }

            var rules = existingSheet.rules;

            existingSheet.rules = [];
            var rules = applyRulesList(existingSheet, rules);
            return translateRuleEntries(rules);
        }
    };

    /**Translates an array of RuleEntry into an array of StyleSheetRules.
    @param {RuleEntry[]} ruleEntries An array of RuleEntry to translate.
    @returns {EVUI.Modules.Styles.StyleSheetRule[]} */
    var translateRuleEntries = function (ruleEntries)
    {
        if (ruleEntries == null) return null;

        var rules = [];

        var numEntries = ruleEntries.length;
        for (var x = 0; x < numEntries; x++)
        {
            var curEntry = ruleEntries[x];

            var rule = new EVUI.Modules.Styles.StyleSheetRule();
            rule.selector = curEntry.selector;
            rule.rules = deepClone(curEntry.rules); //make a copy of the internal object so that when we expose it no one can mess with it and cause problems down the line with things getting out of sync

            rules.push(rule);
        }

        return rules;
    };

    /**Takes a string or an array of string based selectors and turns them into an array of singleton flat selectors.
    @param {String|String[]} compositeSelector Any "flat" css selector or an array of "flat" css selectors.
    @returns {String[]} */
    var getSelectors = function (compositeSelector)
    {
        var selectorArray = [];

        if (typeof compositeSelector !== "string") //our selector is not a string, see if it's an array (the only other valid option)
        {
            if (EVUI.Modules.Core.Utils.isArray(compositeSelector) === true) //we have an array. Break each one down and build a composite list of all of them.
            {
                var numSelectors = compositeSelector.length;

                for (var x = 0; x < numSelectors; x++)
                {
                    var selectors = getSelectors(compositeSelector[x]);
                    if (selectors != null) selectorArray = selectorArray.concat(selectors);
                }

                return selectorArray;
            }
        }
        else
        {
            var firstCommaIndex = getFirstComma(compositeSelector); //because CSS selectors can be "multiple selectors" that are comma separated, we sniff out the first un-escaped comma and use that to determine if we need to break the selector down into multiple selectors.
            if (firstCommaIndex === -1)
            {
                selectorArray.push(compositeSelector); //no comma, no extra work to do.
            }
            else //we have an unescaped comma, time to do some gymnastics to get an array of our special "flat" selectors. The general formula is that everything before the comma separated selector list is a prefix (i.e. @page, @media (condition), etc) that needs to be prepended to each selector thats separated by a comma. 
            {
                var selectorPrefix = "";
                var commaSeparatedSelectors = null;

                compositeSelector = _parser.getNormalizedSelctor(compositeSelector); //first, run the normalization algorithm over the selector to get it into the normalized format so we can make assumptions about its structure that will always be true.

                var whitespaceRegex = new RegExp(/\s/);
                var specialCharacterRegex = new RegExp(/[\>\\~\+]|\|{2}/g);

                compositeSelector = compositeSelector.replace(/\s[\>\\~\+\.]\s|\s\|{2}\s/g, function (match) { return match.trim(); }); //"mash" all the comma separated selectors, their combinators, and everything else we would normally separate with a space into a single space-less string segment
                firstCommaIndex = getFirstComma(compositeSelector); //since we have now changed the length of the string, we need to find that comma index again

                for (var x = firstCommaIndex; x > 0; x--) //now it gets odd - walking BACKWARDS from the first comma, keep walking until we encounter the first whitespace character. That will be the end of our prefix.
                {
                    if (whitespaceRegex.test(compositeSelector[x]) === true)
                    {                        
                        if (x > 0 && specialCharacterRegex.test(compositeSelector[x - 1]) === true) //not whitespace. Is the character that comes before it another combinator? The regex should have caught this, but you never know.
                        {
                            if (x > 1 && compositeSelector[x - 2] === "\\") x--; //is it an ESCAPED combinator? if so, step backwards another character
                            continue; //keep going, we haven't found our valid non-whitespace yet.
                        }

                        //we found the end of the prefix. Chop the string in two and we're done walking the string.
                        selectorPrefix = compositeSelector.substring(0, x);
                        commaSeparatedSelectors = compositeSelector.substr(x);
                        break;
                    }
                }

                //never found a non-whitespace character, so we have no prefix.
                if (commaSeparatedSelectors == null) commaSeparatedSelectors = compositeSelector;
                
                selectorArray = commaSeparatedSelectors.split(",");

                //walk each separated selector and prepend the prefix, then normalize it back into the standard format.
                var numSelectors = selectorArray.length;
                for (var x = 0; x < numSelectors; x++)
                {
                    selectorArray[x] = _parser.getNormalizedSelctor(selectorPrefix + selectorArray[x]);
                }
            }
        }

        return selectorArray;
    }

    /**Gets the index of the first non-escaped comma in the string.
    @param {String} compositeSelector The selector we are looking for a comma in.
    @returns {Number} */
    var getFirstComma = function (compositeSelector)
    {
        var firstCommaIndex = compositeSelector.indexOf(",");
        var isEscaped = (firstCommaIndex > 0 && compositeSelector[firstCommaIndex - 1] === "\\");
        while (isEscaped === true)
        {
            firstCommaIndex = compositeSelector.indexOf(",", firstCommaIndex + 1);
            if (firstCommaIndex === -1) break;

            isEscaped = (firstCommaIndex > 0 && compositeSelector[firstCommaIndex - 1] === "\\");
        }

        return firstCommaIndex;
    };

    /**Updates a rule in a style sheet by deleting the old rule and inserting a new one (or multiple new ones) in its place at the same index.
    @param {RuleEntry[]} flatRules The flattened list of rules to replace the existing rule with.
    @param {Number} index The index of the rule in the style sheet to remove.
    @param {StyleSheetEntry} sheetEntry The existing sheet reference we will be drawing rules from.
    @returns {RuleEntry[]} */
    var updateRules = function (flatRules, index, sheetEntry, existing)
    {
        if (flatRules == null || flatRules.length === 0)
        {
            if (index >= 0) sheetEntry.styleSheet.deleteRule(index); //remove the original rule
            return [];
        }

        var updatedRules = [];
        var deleted = false;
        var rulesUpdated = 0;

        var numFlat = flatRules.length;
        for (var x = 0; x < numFlat; x++)
        {
            var curRule = flatRules[x];

            var ruleText = makeRuleStringFromRuleEntry(curRule);
            var existingRule = (existing != null) ? existing : getExistingRule(sheetEntry, curRule.selector);
            var updated = false;

            if (existingRule == null || (existingRule.cssRuleText !== ruleText || existingRule.cssRule == null || existingRule.cssRule.parentStyleSheet == null))
            {
                try
                {
                    if (deleted === false)
                    {
                        sheetEntry.styleSheet.deleteRule(index); //remove the original rule
                        deleted = true;
                    }

                    var newIndex = sheetEntry.styleSheet.insertRule(ruleText, index + rulesUpdated);
                    updated = true;
                    rulesUpdated++;
                }
                catch (ex)
                {
                    EVUI.Modules.Core.Utils.log("Failed to update rule \"" + ruleText + "\" : " + ex.message);
                    continue;
                }
            }

            if (existingRule == null) //no existing rule, add the new rule to the entry and the return list
            {
                curRule.cssRule = sheetEntry.styleSheet.cssRules[newIndex];
                sheetEntry.rules.push(curRule);
                updatedRules.push(curRule);
            }
            else //we had an existing rule, update it and use it instead of replacing it with a new reference and add it to the return list
            {
                if (updated === true)
                {
                    existingRule.cssRule = sheetEntry.styleSheet.cssRules[newIndex];
                    existingRule.selectors = curRule.selectors;
                    existingRule.selectorsSplit = curRule.selectorsSplit;
                    existingRule.rules = curRule.rules;
                    existingRule.cssRuleText = ruleText;

                    updatedRules.push(existingRule)
                }
            }
        }

        return updatedRules;
    };

    /**Gets an existing rule from the sheet entry's list of existing rules based on its normalized selector.
    @param {StyleSheetEntry} sheetEntry The sheet to look for the pre-existing rule in.
    @param {String} selector A single, flat, normalized selector to match up with the other normalized selectors.
    @returns {RuleEntry} */
    var getExistingRule = function (sheetEntry, selector)
    {
        if (sheetEntry == null || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(selector) === true) return null;

        var numRules = sheetEntry.rules.length;
        for (var x = 0; x < numRules; x++)
        {
            var curRule = sheetEntry.rules[x];
            if (curRule.selector === selector) return curRule;
        }

        return null;
    };

    /**Gets the index of an existing rule in the style sheet.
    @param {StyleSheetEntry} styleSheetEntry The sheet we are looking in.
    @param {any} ruleEntry The rule we are trying to find.
    @returns {Number} */
    var getCssRuleIndex = function (styleSheetEntry, ruleEntry)
    {
        if (styleSheetEntry == null || ruleEntry == null) return -1;

        if (ruleEntry.cssRule != null)
        {
            var numRules = styleSheetEntry.styleSheet.cssRules.length;
            for (var x = 0; x < numRules; x++)
            {
                if (styleSheetEntry.styleSheet.cssRules[x] === ruleEntry.cssRule) return x;
            }
        }

        return -1;
    };

    /**Turns an ambiguous object that could potentially contain rules into an array RuleEntries representing all the "flat" rules that could be parsed out of the input.
    @param {EVUI.Modules.Styles.StyleSheetRule[]|EVUI.Modules.Styles.StyleSheetRule|String|String[]|CSSStyleSheet} ambiguousRulesObject Any one of a bunch of different possible options that could potentially contain CSS rules to parse.
    @param {Boolean} adding Whether or not we are explicitly adding a new style sheet entry.
    @returns {RuleEntry[]} */
    var processRules = function (ambiguousRulesObject, adding)
    {
        if (ambiguousRulesObject instanceof CSSStyleSheet && adding === true) //if we're adding an existing CSS sheet, we have to do a bunch of special treatment to it to properly normalize it and make it work correctly
        {
            return processExistingSheet(ambiguousRulesObject);
        }
        else //otherwise we process the rule object like normal
        {
            var parsedRules = getRulesArray(ambiguousRulesObject); //gets an array of plain objects keyed by selectors (that are broken apart into singleton selectors) that drill down to individual CSS rules.
            var rulesObj = mergeRules(parsedRules); //merge the entire array of objects into a single object that contains all rules for all selectors and correctly overwrites values for duplicate selectors and
            var flatRules = makeFlatRulesList(rulesObj); //walk the object and make flat rules out of the nested object hierarchy that contains the "flat" selector and the set of rules associated with it.

            return flatRules;
        }
    };

    /**Processes an existing CSSStyleSheet into an array of RuleEntries representing a list of the "flat" selectors that could be derived from the CSS sheet. Resolves multiple selectors and duplicate selectors into aggregate objects so no duplicates or multi-selectors appear.
    @param {CSSStyleSheet} cssStyleSheet The style sheet to create a rule set for.
    @returns {RuleEntry[]}*/
    var processExistingSheet = function (cssStyleSheet)
    {
        var dummyEntry = new StyleSheetEntry(); //we need a StyleSheetEntry to make all the supporting functions work, but we don't have one yet when this is called, so we make a fake one to pass around as if it were real
        dummyEntry.styleSheet = cssStyleSheet;
        dummyEntry.rules = [];

        var rulesToRemove = {}; //a mapping of flat selector to an array of CSSRules that tells us what rules need to be removed and merged into a single rule.

        var x = 0
        while (x < cssStyleSheet.cssRules.length) //process all the rules in the sheet. This list will grow as we split rules and merge them into the sheet.
        {
            var rulesToApply = [];
            var curRule = cssStyleSheet.cssRules[x];
            var parsed = _parser.parse(curRule.cssText); //turn the current rule into a plain object and make a flat list of selectors out of the object
            var flat = makeFlatRulesList(parsed);

            var numFlat = flat.length;
            for (var y = 0; y < numFlat; y++) //for every flat rule, assign the corresponding CSS rule (multiple flats from the same rule will share the same CSSRule)
            {
                var curFlat = flat[y];
                curFlat.cssRule = curRule;

                var existing = getExistingRule(dummyEntry, curFlat.selector); //see if this rule hasn't already been added, if it has, don't add it and instead add it to the list of rules to merge and add as a single rule.
                if (existing != null)
                {
                    if (rulesToRemove[existing.selector] == null) rulesToRemove[existing.selector] = [existing];
                    rulesToRemove[existing.selector].push(curFlat);
                    x++; //mark that we processed the rule
                }
                else //otherwise we are going to add it to the list of rules to update in the sheet
                {
                    rulesToApply.push(curFlat);
                }
            }

            //update the sheet with the flat rules and increment the number of rules processed by the number of rules modified
            var updated = updateRules(rulesToApply, x, dummyEntry);
            x += (updated == null) ? 0 : updated.length;
        }

        //now that we have flattened the entire sheet, it can still have duplicate rules in it that mess up the update logic, so we remove them and replace them with the correct aggregate of all the rules with the same selector
        for (var selector in rulesToRemove)
        {
            var aggregateRule = {};

            var rules = rulesToRemove[selector];
            var numToRemove = rules.length;
            var firstIndex = -1;
            for (var x = 0; x < numToRemove; x++)
            {
                merge(rules[x].rules, aggregateRule) //merge the rules onto the aggregate rule to mimic CSS's rule overwriting behavior

                var removalIndex = getCssRuleIndex(dummyEntry, rules[x]); //ge the index of the rule to remove and remove it if it is still in the style sheet
                if (removalIndex !== -1)
                {
                    if (firstIndex === -1) firstIndex = removalIndex;
                    dummyEntry.styleSheet.deleteRule(removalIndex);
                }
            }

            //now, get the original existing rule that is in the managed list of rules and update its rules object to be the aggregate rule before replacing the rule in the style sheet with the new aggregate rule
            var existing = getExistingRule(dummyEntry, selector);
            if (firstIndex !== -1)
            {
                existing.rules = aggregateRule;
                var newRuleText = makeRuleStringFromRuleEntry(existing);

                try
                {
                    var index = dummyEntry.styleSheet.insertRule(newRuleText, firstIndex);
                    existing.cssRule = dummyEntry.styleSheet.cssRules[index];
                }
                catch (ex)
                {
                    EVUI.Modules.Core.Utils.log("Failed to add rule \"" + newRuleText + "\":" + ex.message);

                    var existingIndex = dummyEntry.rules.indexOf(existing);
                    if (existingIndex !== -1) dummyEntry.rules.splice(existingIndex, 1);
                }
            }
        }

        //finally done, now with a unqie flat set of rules that are in sync with the sheet and the managed rule list.
        return dummyEntry.rules;
    }

    /**Turns ambiguous input into an array of plain objects representing hierarchies of CSS properties and selectors.
    @param {String|String[]|EVUI.Modules.Styles.StyleSheetRule|EVUI.Modules.Styles.StyleSheetRule[]|CSSStyleSheet} ambiguousRuleSet Any number of a bunch of different formats.
    @returns {Object[]}*/
    var getRulesArray = function (ambiguousRuleSet)
    {
        if (ambiguousRuleSet == null) return null;

        var rules = [];
        if (typeof ambiguousRuleSet === "string") //we have a CSS string, parse it into an object
        {
           rules.push(_parser.parse(ambiguousRuleSet));
        }
        else if (typeof ambiguousRuleSet === "object") //otherwise we have an object of some sorts
        {
            if (EVUI.Modules.Core.Utils.isArray(ambiguousRuleSet) === true) //it's an array, loop over its contents and call this function again to turn whatever may be inside the array into more parsed objects.
            {
                var numRules = ambiguousRuleSet.length;
                for (var x = 0; x < numRules; x++)
                {
                    var curRule = getRulesArray(ambiguousRuleSet[x]);
                    if (curRule == null) continue;

                    rules = rules.concat(curRule);
                }
            }
            else if (ambiguousRuleSet instanceof CSSStyleSheet) //its a style sheet, turn all its rules into objects by parsing each one
            {
                var numRules = ambiguousRuleSet.cssRules.length;
                for (var x = 0; x < numRules; x++)
                {
                    rules.push(_parser.parse(ambiguousRuleSet.cssRules[x].cssText));
                }
            }
            else if ((typeof ambiguousRuleSet.selector === "string" || EVUI.Modules.Core.Utils.isArray(ambiguousRuleSet.selector) === true) && ambiguousRuleSet.rules != null) //we have a YOLO of a StyleSheetRule object.
            {
                var selectors = getSelectors(ambiguousRuleSet.selector); //break up the selector into its normalized components
                var parsedRules = null;
                var ruleObj = {};
                var numSelectors = selectors.length;
                for (var x = 0; x < numSelectors; x++)
                {
                    var selector = selectors[x];
                    
                    if (parsedRules == null && typeof ambiguousRuleSet.rules === "string") //if the rules were a string, only parse it once
                    {
                        parsedRules = _parser.parse(ambiguousRuleSet.rules);
                        ruleObj[selector] = parsedRules;
                    }
                    else if (typeof ambiguousRuleSet.rules === "object") //if the rules are an object, clone it so overwriting different rules don't bleed into each other due to sharing references.
                    {
                        if (EVUI.Modules.Core.Utils.isArray(ambiguousRuleSet.rules)) //the rules are an array of some sort. Drawing the line here, it can get a lot more complicated trying to figure out what to do from this point, so we stop here and can revist at a late date
                        {
                            throw Error("A rule object with a selector cannot have an array as its set of rules.");
                        }
                        else
                        {
                            if (ruleObj[selector] != null) //duplicate selector, merge the new rules into the clone
                            {
                                merge(deepClone(parsedRules != null ? parsedRules : ambiguousRuleSet.rules), ruleObj[selector]);
                            }
                            else //otherwise just clone the rules
                            {
                                ruleObj[selector] = deepClone(parsedRules != null ? parsedRules : ambiguousRuleSet.rules);
                            }
                        }
                    }

                    rules.push(ruleObj)
                }
            }
        }

        return rules;
    };

    /**Merges one object into another.
    @param {Object} source The object with the properties to merge onto the target.
    @param {Object} target The object to receive the properties from the source.
    @param {Object[]} parentage Array of previously processed objects to stop an infinite recursive loop.
    @returns {Object}*/
    var merge = function (source, target, parentage)
    {
        if (parentage == null) parentage = [source];

        for (var prop in source)
        {
            var sourceValue = source[prop];
            var targetValue = target[prop];

            if (sourceValue != null && typeof sourceValue === "object") //we have a child object, merge recursively
            {
                if (targetValue == null) //object doesn't exist on target, just add it
                {
                    target[prop] = sourceValue;
                }
                else if (typeof targetValue === "object") //if the target already has an object, merge the two together
                {
                    if (parentage.indexOf(sourceValue) !== -1) continue; //if the parent is in the chain of objects that are being merged, we're in an endless loop and need to not recurse anymore
                    parentage.push(sourceValue);

                    merge(sourceValue, targetValue, parentage.slice());

                    parentage = [];
                }
            }
            else //not an object, just assign it
            {
                if (typeof sourceValue !== "string") //if the source value is EXPLICITLY null, delete it from the target
                {
                    if (typeof sourceValue === "number")
                    {
                        target[prop] = sourceValue.toString();
                    }
                    else
                    {
                        if (sourceValue === null) delete target[prop];
                    }
                }
                else if (sourceValue.toLowerCase() === "null") //if the source value is EXPLICITLY the string "null" delete it from the target.
                {
                    delete target[prop];
                }
                else //otherwise just assign it
                {
                    target[prop] = sourceValue;
                }
            }          
        }

        return target;
    };

    /**A super simple deep clone function for cloning plain objects.
    @param {Object} source The object with the properties to merge onto the target.
    @param {Object} target The object to receive the properties from the source.
    @param {Object[]} parentage Array of previously processed objects to stop an infinite recursive loop.
    @returns {Object}*/
    var deepClone = function (source, target, parentage)
    {
        if (source == null) return target;
        if (target == null) target = {};
        if (parentage == null) parentage = [source];

        for (var prop in source)
        {
            var sourceValue = source[prop];
            if (sourceValue == null) continue;

            if (typeof sourceValue === "object")
            {
                if (parentage.indexOf(sourceValue) !== -1)
                {
                    target[prop] = source;
                }

                parentage.push(source);
                target[prop] = deepClone(sourceValue, EVUI.Modules.Core.Utils.isArray(sourceValue) ? [] : {}, parentage);

                parentage = [];
            }
            else
            {
                target[prop] = sourceValue;
            }
        }

        return target;
    };

    /**Merges a list of objects into each other to form a composite object of the union of all their properties.
    @param {Object[]} rulesArray All of the rule objects to merge into a single object.
    @returns {Object}*/
    var mergeRules = function (rulesArray)
    {
        var merged = {};
        var numRules = rulesArray.length;
        for (var x = 0; x < numRules; x++)
        {
            merge(rulesArray[x], merged);
        }

        return merged;
    };

    /**Takes an object of CSS rules (and nested rules) and turns it into an array of "flat" selectors.
    @param {any} rulesObj The aggregate of all the rules to merge into a flat list of objects.
    @returns {RuleEntry[]}*/
    var makeFlatRulesList = function (rulesObj)
    {
        var rules = [];

        for (var prop in rulesObj)
        {
            var flattended = makeFlatSelectors(rulesObj, prop);
            if (flattended != null) rules = rules.concat(flattended);
        }

        return rules;
    };

    /**Takes an array of RuleEntry and applies them to a style sheet.
    @param {StyleSheetEntry} styleSheet The stylesheet entry containing both the rules and the style sheet to add them to.
    @param {RuleEntry[]} flatRulesList The rules to add to the style sheet.
    @returns {RuleEntry}*/
    var applyRulesList = function (styleSheet, flatRulesList)
    {
        var rulesAdded = [];

        for (var x = 0; x < flatRulesList.length; x++)
        {
            var curRule = flatRulesList[x];

            var rule = makeRuleStringFromRuleEntry(curRule);

            try
            {
                var index = styleSheet.styleSheet.insertRule(rule, styleSheet.styleSheet.cssRules.length);
                curRule.cssRule = styleSheet.styleSheet.cssRules[index];
                curRule.cssRuleText = rule;

                styleSheet.rules.push(curRule);
                rulesAdded.push(curRule);
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log("Failed to add rule \"" + rule + "\":" + ex.message);
            }
        }

        return rulesAdded;
    };

    /** Walks an aggregate object recursively to produce an array of RuleEntry objects with the base "flat" selectors we used for managing all the style entries.
    @param {Object} rulesObj A merged, aggregate rule object with keys of normalized css selector segments and properties of sub-objects of more selectors or actual object keys.
    @param {String} prop The property of the rules object that is being drilled into.
    @param {String} selector The current flattened aggregate selector.
    @param {String[]} selectors The chain of selectors from the root to the current object.
    @returns {RuleEntry[]}*/
    var makeFlatSelectors = function (rulesObj, prop, selector, selectors)
    {
        if (selectors == null) selectors = [];
        selectors.push(prop);

        var nextObj = rulesObj[prop];

        var rules = [];

        if (selector == null)
        {
            selector = prop;
        }
        else
        {
            selector = selector + " " + prop
        }

        if (isAggregatedNonCascadingSet(prop) === true)
        {
            var ruleEntry = new RuleEntry();
            ruleEntry.rules = nextObj;
            ruleEntry.selector = selector;
            ruleEntry.selectors = selectors;

            return [ruleEntry];
        }        

        for (var innerProp in nextObj)
        {
            var innerValue = nextObj[innerProp]
            if (innerValue == null) continue;

            if (typeof innerValue !== "object") //the inner value is finally not an object, we stop drilling as we are at the CSS rule set at the bottom of the rule hierarchy
            {
                var ruleEntry = new RuleEntry();
                ruleEntry.rules = nextObj;
                ruleEntry.selector = selector;
                ruleEntry.selectors = selectors;

                return [ruleEntry];
            }
            else //we have a sub object. continue drilling.
            {
                var innerRules = makeFlatSelectors(nextObj, innerProp, selector, selectors.slice());
                if (innerRules != null)
                {
                    rules = rules.concat(innerRules);
                }
            }
        }

        return rules;

    };

    /**Determines whether or not the CSS rule can be broken down into sub-rules or must be treated as a set (i.e., @keyframes) that does not follow the normal cascading rules everything else does.
    @param {String} selector The selector segment to test for the aggregation property.
    @returns {Boolean} */
    var isAggregatedNonCascadingSet = function (selector)
    {
        var numAggregationSets = _aggregationSets.length;
        for (var x = 0; x < numAggregationSets; x++)
        {
            if (EVUI.Modules.Core.Utils.stringStartsWith(_aggregationSets[x], selector) === true) return true;
        }

        return false;
    }

    /**Makes sure that a CSSStyleSheet is applied in the DOM. If it is not, a clone of it is made and inserted into the DOM so the CSS rules persist the deletion of their parent object.
    @param {StyleSheetEntry} styleSheet The entry to revive if it has been removed. */
    var ensureSheetInDom = function (styleSheet)
    {
        if (styleSheet.styleSheet.ownerNode == null) //this will be null if the sheet has been cut out of the DOM. We can't re-attach it, so we have to make a new style sheet and clone our rule set.
        {
            var clone = makeSheetClone(styleSheet);
            styleSheet.styleSheet = clone;
        }
        else //is part of the DOM
        {
            if (styleSheet.styleSheet.ownerNode.isConnected === false) document.head.appendChild(syleSheet.ownerNode); //but it's an orphan, re-attach
            if (styleSheet.disabled === true) styleSheet.disabled = false; //flip the disabled flag if it got flipped on somehow.
        }
    };

    /**Applies all the in-memory properties in the manager to the newly cloned style sheet.
    @param {StyleSheetEntry} styleSheet The entry to clone the sheet of. */
    var makeSheetClone = function (styleSheet)
    {
        var styleElement = makeStyleSheetElement();

        var rules = styleSheet.rules;
        styleSheet.rules = [];
        applyRulesList(styleSheet, rules); //adding rules builds the styleSheet's rule index, so we clear it and rebuild it
        styleSheet.styleSheet = styleElement.sheet;         
    };

    /**Creates a style element and appends it to the head.
    @returns {HTMLStyleElement}*/
    var makeStyleSheetElement = function ()
    {
        var styleElement = document.createElement("style");
        document.head.appendChild(styleElement);

        return styleElement;
    };

    /**Gets a sheet name based on its name in a case-insensitive search.
    @param {any} name The name of the style sheet to get.
    @returns {StyleSheetEntry}*/
    var getStylesheetEntry = function (name)
    {
        var numSheets = _stylesheets.length;
        var lowerSheetName = name.toLowerCase();

        for (var x = 0; x < numSheets; x++)
        {
            var curSheet = _stylesheets[x];
            if (curSheet.name.toLowerCase() === lowerSheetName) return curSheet;
        }

        return null;
    };

    /**Turns a RuleEntry into a valid CSS string we can insert into a style sheet without it crashing.
    @param {RuleEntry} ruleEntry The rule to translate into a CSS string.
    @returns {String}*/
    var makeRuleStringFromRuleEntry = function (ruleEntry)
    {
        if (ruleEntry == null) return "";

        var selector = ""; //the nested selector
        var postFix = ""; //all the close brackets needed

        var numSelectors = ruleEntry.selectors.length;
        if (numSelectors === 1 && ruleEntry.selectorsSplit === false) //if we have never split the selector, split it apart into its component pieces so making the nested rule is easier.
        {
            ruleEntry.selectors = _parser.breakUpSelector(ruleEntry.selector);
            numSelectors = ruleEntry.selectors.length;

            ruleEntry.selectorsSplit = true;
        }

        for (var x = 0; x < numSelectors; x++) //make the outer nested part from the flat selector
        {
            if (x > 0)
            {
                selector = selector + " { " + ruleEntry.selectors[x];
                postFix += "}"
            }
            else
            {
                selector = ruleEntry.selectors[x];
            }
        }

        //var rules = "{";
        //var capitalLettersRegex = new RegExp(/(?!^)[A-Z]/g);

        //for (var prop in ruleEntry.rules) //turn every camelCase property into a snake-case CSS property.
        //{
        //    var snakeCased = prop.replace(capitalLettersRegex, function (match) { return "-" + match.toLowerCase() }).toLowerCase();
        //    rules += snakeCased + ":" + ruleEntry.rules[prop] + "; ";
        //}

        //rules += "}";

        var rules = rulesToString(ruleEntry.rules);

        return selector + rules + postFix;
    };

    /**Recursively turns a CSS rule object (or aggregated rule object) into an appropriate CSS string.
    @param {Object} rulesObj An object of rules or nested rules.
    @returns {String}*/
    var rulesToString = function (rulesObj)
    {
        var rules = "{";
        var capitalLettersRegex = new RegExp(/(?!^)[A-Z]/g);

        for (var prop in rulesObj) //turn every camelCase property into a snake-case CSS property.
        {
            var snakeCased = prop.replace(capitalLettersRegex, function (match) { return "-" + match.toLowerCase() }).toLowerCase();
            var curRule = rulesObj[prop];

            if (curRule != null && typeof curRule === "object")
            {
                rules += snakeCased + " " + rulesToString(curRule);
            }
            else
            {
                rules += snakeCased + ":" + curRule + "; ";
            }
        }

        rules += "}"

        return rules;
    }

    /**Internal entry for pairing a name to a stylesheet object.
    @class*/
    var StyleSheetEntry = function ()
    {
        /**String. The user-given name of the stylesheet.
        @type {String}*/
        this.name = null;

        /**Object. The DOM stylesheet object that contains the rules for the stylesheet.
        @type {CSSStyleSheet}*/
        this.styleSheet = null;

        /**Boolean. Whether or not to lock the style sheet and prevent it from being removed from the internal list of style sheets.
        @type {Boolean}*/
        this.lock = false;

        /**Array. An array of StyleSheetRule representing all the rules added to the sheet through the StyleSheetManager.
        @type {RuleEntry[]}*/
        this.rules = [];
    };

    /**Represents an entry of a programmatically added rule.
    @class*/
    var RuleEntry = function ()
    {
        /**String. The aggregated selector used to target the CSS rules.
        @type {String}*/
        this.selector = null;

        /**Object. The rules object.
        @type {Object}*/
        this.rules = null;

        /**Array. The array of nested selectors that were used to target the CSS rules.
        @type {String[]}*/
        this.selectors = [];

        /**Object. The matching CSSRule that exists on a stylesheet.
        @type {CSSRule}*/
        this.cssRule = null;

        /**String. The text of the CSS rule that was injected into the style sheet.
        @type {String}*/
        this.cssRuleText = null;

        /**Boolean. Whether or not the selector has already been split into segments.
        @type {Boolean}*/
        this.selectorsSplit = false;
    };

    this.addStyleSheet(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, { lock: true });
};

/**Represents a CSS Selector and the Rules associated with it.
@class*/
EVUI.Modules.Styles.StyleSheetRule = function ()
{
    /**String. Any CSS selector.
    @type {String}*/
    this.selector = null;

    /**String. A string of CSS rules separated by semicolons or an object where the key is the css property name and the value is the value of the property. If an object is used, camelCase or PascalCase property names will be snake cased in the final CSS string.
    @type {String|Object}*/
    this.rules = null;
};

/**Utility class for taking a string of arbitrary CSS and turning it into a JSON object.
@class*/
EVUI.Modules.Styles.StyleParser = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Styles.Dependencies);

    var _snakeCaseToCamelCaseRegex = new RegExp(/(?!^)(\-)([A-Z])/ig);
    var _openCurlyRegex = new RegExp(/\{/g);
    var _closeCurlyRegex = new RegExp(/\}/g);
    var _isTagNameRegex = new RegExp(/[#\.\[\]]/g);
    var _whitespaceRegex = new RegExp(/\s+/g)
    var _combinatorsRegex = new RegExp(/[\>\\~\+]|\|{2}/g);

    /**Parses a string of CSS into an object.
    @param {any} css Any string of valid CSS. Can be a single rule, a selector/nested selector, or an entire stylesheet.
    @returns {Object}*/
    this.parse = function (css)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(css) === true) return null;

        var session = new ParseSession();
        session.rawCSS = removeComments(css);
        session.openMatches = getMatches(_openCurlyRegex, session.rawCSS, true);
        session.closeMatches = getMatches(_closeCurlyRegex, session.rawCSS, true);


        if (session.openMatches.length === 0 && session.closeMatches.length === 0) return makeRulesFromString(session.rawCSS);

        return walk(session, {});
    };

    /**Takes a single, isolated selector (something like "@page @media (someCondition) h1" and not "@page @media (someCondition) h1, h2, div") and breaks it into its nested components if it is a nested selector. Does not respect commas in selectors.
    @param {String} selector The potentially nested selector to break apart.
    @returns {Stirng[]}*/
    this.breakUpSelector = function (selector)
    {
        var whitespace = getMatches(_whitespaceRegex, selector);
        if (whitespace.length === 0) return [selector];

        var atSelectors = getMatches(new RegExp(/\@/g), selector, true);
        var parensSelectors = getMatches(new RegExp(/\)/g), selector, true);

        var index = 0;
        var atIndex = 0;
        var parenIndex = 0;
        var selectors = [];

        while (index < selector.length)
        {
            var firstAt = atSelectors[atIndex];
            var nextAt = atSelectors[atIndex + 1];
            var nextCloseParens = parensSelectors[parenIndex]

            if (firstAt == null && nextAt == null && nextCloseParens == null) //found no tokens to base nesting off of, we are done
            {
                if (selectors.length > 0)
                {
                    selectors.push(selector.substring(index));
                    return selectors;
                }
                else
                {
                    return [selector];
                }
            }
            else if (firstAt != null && nextAt != null) //we have one @selector
            {
                var selectorSegment = selector.substring(firstAt.index, nextAt.index); //snip the selector from the index to the end of the last )
                selectors.push(selectorSegment);

                atIndex++;
                index = nextAt.index + nextAt.length;
            }
            else
            {
                if (nextCloseParens != null) //and it has conditions after it 
                {
                    var selectorSegment = selector.substring(firstAt.index, nextCloseParens.index + 1); //snip the selector from the index to the end of the last )
                    selectors.push(selectorSegment);

                    parenIndex++;
                    index = nextCloseParens.index + 2;
                }
                else //we have no parenthesis, look for another nested @selctor
                {
                    //var nextWhitespace = null;
                    //var numWhitespace = whitespace.length;
                    //for (var x = 0; x < numWhitespace; x++)
                    //{
                    //    var curWhitespace = whitespace[x];
                    //    if (curWhitespace.index > index)
                    //    {
                    //        nextWhitespace = curWhitespace;
                    //        break;
                    //    }
                    //}

                    //if (nextWhitespace != null) //cut to the next whitespace
                    //{
                    //    selectors.push(selector.substring(firstAt.index, nextWhitespace.index));
                    //    index = nextWhitespace.index + 1;
                    //}
                    //else //cut to the end of the sting, we are done
                    //{
                        selectors.push(selector.substring(firstAt.index));
                        return selectors;
                    //}                    
                }

                atIndex++;
            }
        }

        return selectors;
    };

    /**Normalizes a single, isolated selector (something like "@page @media (someCondition) h1" and not "@page @media (someCondition) h1, h2, div") so that it is formatted consistently no matter the input format. 
    Case-corrects tag names and other non-case sensitive selector components to be lower case (but leaves case-sensitive selectors untouched), and spaces out combinator selectors so that they are always separated by a space on both sides.
    @param {String} selector The selector to normalize.
    @returns {String} */
    this.getNormalizedSelctor = function (selector)
    {
        return normalizeSelector(selector);
    };

    /**Cleans all the CSS comments out of a string of CSS.
    @param {String} css The CSS to remove comments from.
    @returns {String}*/
    var removeComments = function (css)
    {
        var cleanCSS = "";
        var index = 0;
        var length = css.length;
        var editedString = false;

        while (index < length)
        {
            var commentStart = css.indexOf("/*", index);
            var commentEnd = css.indexOf("*/", index);

            if (commentStart === -1 || commentEnd === -1) break;

            editedString = true;
            cleanCSS += css.substring(index, commentStart);
            index = commentEnd + 2;
        }

        if (editedString === true)
        {
            cleanCSS += css.substring(index);
            return cleanCSS;
        }
        else
        {
            return css;
        }
    };

    /**Gets all the matches for a regex in a string, optionally avoiding sequences that begin with the escape character "\"
    @param {RegExp} regex The regular expression to run.
    @param {String} str The string to run the regex over
    @param {any} ignoreEscapes Whether or not to ignore matches that begin with "\"
    @returns {Match[]}*/
    var getMatches = function (regex, str, ignoreEscapes)
    {
        if (typeof str !== "string" || regex == null) return null;

        var matches = [];

        var allMatches = str.matchAll(regex);
        var nextMatch = allMatches.next();
        while (nextMatch.done === false)
        {
            var precedingChar = (nextMatch.value.index > 0) ? str[nextMatch.value.index - 1] : "";
            if (ignoreEscapes === true && precedingChar !== "\\") //because fuck figuring out the regex for "match any curly brace that is NOT preceded by a '\'"
            {
                var match = new Match(nextMatch.value.index, nextMatch.value[0], nextMatch.value[0].length);
                matches.push(match);
            }
            else if (ignoreEscapes !== true)
            {
                var match = new Match(nextMatch.value.index, nextMatch.value[0], nextMatch.value[0].length);
                matches.push(match);
            }

            nextMatch = allMatches.next();
        }

        return matches;
    };

    /**Walks the CSS string and parses it into a JSON object.
    @param {ParseSession} session The metadata about the operation in progress.
    @returns {Object}*/
    var walk = function (session, curObj)
    {
        var totalLength = session.rawCSS.length;

        while (session.index < totalLength)
        {
            var nextOpen = session.openMatches[session.openIndex];
            var secondOpen = session.openMatches[session.openIndex + 1];
            var nextClose = session.closeMatches[session.closeIndex];

            if (nextOpen == null) break; //end of graph
            if (nextClose == null) break; //something wrong, it was left open

            if (nextOpen.index > session.index) //the next open brace is between our last open brace and our next one
            {
                if (secondOpen != null && secondOpen.index < nextClose.index) //the second open brace is before the next close brace, we are outside a nested block
                {
                    var selector = session.rawCSS.substring(session.index != 0 ? session.index + 1 : 0, nextOpen.index).trim(); //the selector will be the gap between our current position and the next curly brace

                    session.openIndex++;
                    session.index = nextOpen.index;

                    var selectors = selector.split(",");
                    var numSelectors = selectors.length;
                    for (var x = 0; x < numSelectors; x++) //split the selector if it was a multi-selector
                    {
                        var curSelector = normalizeSelector(selectors[x]);

                        var existing = curObj[curSelector]; //if we already have the object, just re-read properties onto it
                        if (existing != null)
                        {
                            curObj[curSelector] = walk(session, existing);
                        }
                        else //otherwise start with a new object
                        {
                            curObj[curSelector] = walk(session, {});
                        }
                    }
                }
                else if (session.index === nextClose.index) //if the index and the close index are the same, we're at the end of a nested block and need to break out of the loop
                {
                    session.closeIndex++;
                    session.index++;
                    break;
                }
                else //otherwise we're inside of a block and just need to parse out the actual CSS properties into an object
                {
                    var selector = session.rawCSS.substring(session.index != 0 ? session.index + 1 : 0, nextOpen.index).trim();
                    if (selector.length > 0)
                    {
                        var selectors = selector.split(",");
                        var numSelectors = selectors.length;
                        var newObj = makeRulesFromString(session.rawCSS.substring(nextOpen.index + 1, nextClose.index)); //make the new object once

                        for (var x = 0; x < numSelectors; x++)
                        {
                            var curSelector = normalizeSelector(selectors[x]);
                            if (x > 0) newObj = EVUI.Modules.Core.Utils.shallowExtend({}, newObj);

                            var existing = curObj[curSelector];
                            if (existing != null)
                            {
                                curObj[curSelector] = EVUI.Modules.Core.Utils.shallowExtend(existing, newObj); //extend the new object onto the existing if it's already there
                            }
                            else
                            {
                                curObj[curSelector] = newObj; //otherwise set the object
                            }
                        }
                        
                        session.index = nextClose.index + 1;
                    }
                    else //we a rule string without a selector
                    {
                        return makeRulesFromString(session.rawCSS.substring(nextOpen.index + 1, nextClose.index));
                    }

                    session.openIndex++;
                    session.closeIndex++;
                }
            }
            else
            {
                break;
            }
        }

        return curObj;
    };

    /**Makes a rules object from a segment of CSS that is not surrounded by curly braces.
    @param {String} css The CSS to make into an object.
    @returns {Object}*/
    var makeRulesFromString = function (css)
    {  
        var ruleGraph = {};
        var rules = css.split(";");
        var numRules = rules.length;
        for (var x = 0; x < numRules; x++)
        {
            var curRule = rules[x];
            var firstColonIndex = curRule.indexOf(":");
            if (firstColonIndex === -1) continue;

            var key = curRule.substring(0, firstColonIndex).toLowerCase().trim();
            var value = curRule.substring(firstColonIndex + 1).trim();

            key = key.replace(_snakeCaseToCamelCaseRegex, function (match) { return match[1].toUpperCase(); });
            ruleGraph[key] = value;
        }

        return ruleGraph;
    };

    /**Normalizes the selector so that it is formatted consistently no matter the input format. Case-corrects tag names and other non-case sensitive selector components to be lower case (but leaves case-sensitive selectors untouched), and spaces out combinator selectors so that they are always separated by a space on both sides.
    @param {String} selector The selector to normalize.
    @returns {String} */
    var normalizeSelector = function (selector)
    {
        if (typeof selector !== "string") return null;

        //make sure parentheses are always flanked by a space, and make sure all commas are formatted the way they would be in grammatically correct English.
        selector = selector.replace(/\)|\(/g, function (match) { return match === ")" ? ") " : " (" }).replace(/\,|\s\,|\,\s/g, ", ");

        var normalizedSelector = "";
        var subSelectors = selector.trim().split(_whitespaceRegex); //break the whole string apart based on whitespace
        var numSubSelectors = subSelectors.length;

        for (var x = 0; x < numSubSelectors; x++) //then re-assemble it while case-normalizing the segments that need to be case normalized and leaving the case-sensitive parts of the selector alone.
        {
            var curSubSelector = subSelectors[x];
            var combinatorMatches = getMatches(_combinatorsRegex, curSubSelector, true);   //get all the combinator selectors in the current segment          

            var numCombinators = combinatorMatches.length;
            if (numCombinators === 0) //no combinators, just normalize the case of the segment
            {
                normalizedSelector = normalizeCase(curSubSelector, (x === 0), normalizedSelector);
            }
            else //we have combinators, we want each one flanked by a space on both sides.
            {
                var index = 0;
                for (var y = 0; y < numCombinators; y++)
                {
                    var curCombinator = combinatorMatches[y];
                    var curCombinatorMatch = curSubSelector.substring(index, curCombinator.index); //grab everything from the index to the combinator

                    index = curCombinator.index + curCombinator.length;

                    normalizedSelector = normalizeCase(curCombinatorMatch, (x === 0), normalizedSelector); //normalize the case of this segment
                    normalizedSelector = normalizedSelector + " " + curCombinator.match; //flank it with spaces
                }

                normalizedSelector = normalizeCase(curSubSelector.substring(index), false, normalizedSelector); //nromalize the rest of the string
            }
        }

        return normalizedSelector.replace(_whitespaceRegex, " "); //finally, remove any duplicate spaces that may have been injected into the string from wrinkes in the logic above.
    };

    /**Normalizes the case of tag names and other case-insensitive parts of a selector, but leaves case-sensitive parts of the selector in their original case.
    @param {any} selector The selector to case normalize.
    @param {any} isFirst Whether or not it is the first part of a selector string.
    @param {any} normalizedSelector A pre-existing normalized selector to append the results to.
    @returns {String} */
    var normalizeCase = function (selector, isFirst, normalizedSelector)
    {
        var caseSensitiveMatches = getMatches(_isTagNameRegex, selector, true);

        var numMatches = caseSensitiveMatches.length;
        if (numMatches > 0)
        {
            var curMatch = caseSensitiveMatches[0];
            var normalized = selector.substring(0, curMatch.index).toLocaleLowerCase();

            normalizedSelector = normalizedSelector + ((isFirst === true) ? normalized : " " + normalized) + selector.substring(curMatch.index);
        }
        else
        {
            var normalized = selector.toLocaleLowerCase();
            normalizedSelector = normalizedSelector + ((isFirst === true) ? normalized : " " + normalized);
        }

        return normalizedSelector;
    }

    /**Represents a parsing of CSS in progress. */
    var ParseSession = function ()
    {
        /**Number. The current index the parser is at in the rawCss.
        @type {Number}*/
        this.index = 0;

        /**The raw CSS string.
        @type {String}*/
        this.rawCSS = null;

        /**Array. All of the open curly brace locations.
        @type {Match[]}*/
        this.openMatches = null;

        /**Array. All of the close curly brace locations.
        @type {Match[]}*/
        this.closeMatches = null;

        /**Number. The index of the current open curly brace in the openMatches array.
        @type {Number}*/
        this.openIndex = 0;

        /**Number. The index of the current close curly brace in the closeMatches array.
        @type {Number}*/
        this.closeIndex = 0;
    };

    /**Represents a Regex match.
    @class*/
    var Match = function (index, match, length)
    {
        /**Number. The index of the match in the source string.
        @type {Number}*/
        this.index = (typeof index !== "number") ? 0 : index;

        /**String. The matching part of the string.
        @type {String}*/
        this.match = (typeof match !== "string") ? null : match;

        /**Number. The length of the match.
        @type {Number}*/
        this.length = (typeof length !== "number") ? 0 : length;
    };
};

/**Parameters object for the $evui.css function. Different combinations of parameters produce different operations. All operations except for sheet removal return an array of the effected StyleSheetRules.
@class*/
EVUI.Modules.Styles.CSSOptions = function ()
{
    /**String. The name of the sheet to add rules to, get rules from, or remove entirely. If omitted the DefaultStyleSheetName is used from the module's Constants table.
    @type {String}*/ 
    this.sheetName = null;

    /**String or Array. Either a CSS selector or an array of CSS selectors to set rules on or to remove entirely. Note that selectors for rules nested in at-rules are accessed by their "flat" path name, i.e. the style block inside of @page { @media (condition) { h1 { display: none; }}} would be accessed via "@page @media (condition) h1".
    @type {String|String[]}*/
    this.selector = null;

    /**String or Object or Array. A set of rules to add, change, or remove. 
     
    Can be:
    1. A full CSSStyleSheet object, or an array of CSSStyleSheet objects.
    2. A single, or an array of, StyleSheetRule objects.
    3. A string of CSS with multiple selectors, or an array of strings of CSS with multiple selectors.
    4. A string of CSS rules without a selector, or an array of strings of CSS rules without selectors.
    5. A "style" object or an array of "style" objects (an object with css properties as camelCased property names).

    To remove a rule from a selector's rule set, specify its value as the string "null".
    @type {String|String[]|EVUI.Modules.Styles.StyleSheetRule|EVUI.Modules.Styles.StyleSheetRule[]|CSSStyleSheet|CSSStyleSheet[]}*/
    this.rules = null;

    /**Whether or not to remove any rules with a matching selector, or if no selector is provided, the entire rule sheet with the given sheetName.
    @type {Boolean}*/
    this.remove = false;
};

/**Enum for describing the way to sync the internal entries of the StyleSheetManager and one of the CSSStyleSheets it manages.
@enum*/
EVUI.Modules.Styles.SyncMode =
{
    /**Indicates that the internal rules array will be cleared and re-set to match the current state of the style sheet.*/
    FromSheet: "fromSheet",
    /**Indicates that the style sheet will have its rules cleared and be synced to the interal rules array.*/
    ToSheet: "toSheet"
};
Object.freeze(EVUI.Modules.Styles.SyncMode);

/**Global instance of HttpEventStream, a utility used for making HTTP requests in a sequence.
@type {EVUI.Modules.Styles.StyleSheetManager}*/
EVUI.Modules.Styles.Manager = null;
(function ()
{
    var styleSheetManager = null;
    var ctor = EVUI.Modules.Styles.StyleSheetManager;

    Object.defineProperty(EVUI.Modules.Styles, "Manager",
    {
        get: function ()
        {
            if (styleSheetManager == null)
            {
                styleSheetManager = new ctor();
            }

            return styleSheetManager;
        },
        enumerable: true,
        configurable: false
    });
})();

delete $evui.styles;

/**Gets the global instance of HttpEventStream, a utility used for making HTTP requests in a sequence.
@type {EVUI.Modules.Styles.StyleSheetManager}*/
$evui.styles = null;
Object.defineProperty($evui, "styles",
{
    get: function ()
    {
        return EVUI.Modules.Styles.Manager;
    },
    enumerable: true
});

/**Gets, sets, or removes a set of CSS rules from the a style sheet that has previously been added to the $evui.styles StyleSheetManager.
@param {EVUI.Modules.Styles.CSSOptions|String} cssOrOptions Either a YOLO CSSOptions object or a string of raw CSS.
@returns {EVUI.Modules.Styles.StyleSheetRule[]} */
$evui.css = function (cssOrOptions)
{
    if (cssOrOptions == null) return null;
    if (typeof cssOrOptions === "string")
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(cssOrOptions) === true) return;
        return $evui.styles.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, cssOrOptions);
    }
    else if (typeof cssOrOptions === "object")
    {
        var sheetName = EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(cssOrOptions.sheetName) === true ? EVUI.Modules.Styles.Constants.DefaultStyleSheetName : cssOrOptions.sheetName;
        var selector = (EVUI.Modules.Core.Utils.isArray(cssOrOptions.selector) === true || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(cssOrOptions.selector) === false) ? cssOrOptions.selector : null;
        var rules = (cssOrOptions.rules != null && (typeof cssOrOptions.rules === "object" || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(cssOrOptions.rules) === false)) ? cssOrOptions.rules : null;
        var remove = (typeof cssOrOptions.remove !== "boolean") ? false : cssOrOptions.remove;

        if (remove === true)
        {
            if (selector != null)
            {
                return $evui.styles.removeRules(sheetName, selector);
            }
            else
            {
                var existingRules = $evui.styles.getRules(sheetName);
                var removed = $evui.styles.removeStyleSheet(sheetName);

                if (removed === true) return existingRules;
                return null;
            }
        }

        if (selector == null)
        {
            if (rules != null)
            {
                return $evui.styles.setRules(sheetName, rules);
            }
            else
            {
                return $evui.styles.getRules(sheetName);
            }
        }
        else
        {
            if (rules != null)
            {
                if (rules instanceof CSSStyleSheet)
                {
                    return $evui.styles.setRules(sheetName, rules);
                }
                else if (EVUI.Modules.Core.Utils.isArray(rules) === true && rules.length > 0 && rules[0].selector != null)
                {
                    return $evui.styles.setRules(sheetName, rules);
                }
                else
                {
                    return $evui.styles.setRules(sheetName, selector, rules);
                }                
            }
            else
            {
                return $evui.styles.getRules(sheetName, selector);
            }
        }
    }
};

Object.freeze(EVUI.Modules.Styles.Constants);
Object.freeze(EVUI.Modules.Styles);

/*#ENDWRAP(Styles)#*/