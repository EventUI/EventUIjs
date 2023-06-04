/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel.Interfaces;
using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.Design;
using System.Linq;
using System.Reflection.PortableExecutable;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public static class JSONTestDeserializer
    {
        private static HashSet<JsonTokenType> _valueTypeTokens = new HashSet<JsonTokenType>() { JsonTokenType.String, JsonTokenType.Number, JsonTokenType.True, JsonTokenType.False, JsonTokenType.Null };

        public static JSONParseResult Deserialize(string json)
        {
            Utf8JsonReader reader = new Utf8JsonReader(new Span<byte>(Encoding.UTF8.GetBytes(json)), new JsonReaderOptions() { CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true });
            reader.Read();

            if (reader.TokenType != JsonTokenType.StartObject && reader.TokenType != JsonTokenType.StartArray) throw new Exception("Invalid JSON - must be a single object or an array.");
            JSONParsedObject result = new JSONParsedObject();
            result.DataType = reader.TokenType;

            var deserialized = Deserialize(ref reader, result);
            if (deserialized is JSONParsedObject parsedObj == false) return null;

            return BuildObject(parsedObj);
        }

        private static JSONParsedProperty Deserialize(ref Utf8JsonReader reader, JSONParsedObject parent)
        {
            int arrayCtr = 0;
            string currentPropName = null;
            bool isArray = parent.DataType == JsonTokenType.StartArray;

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.PropertyName)
                {
                    currentPropName = reader.GetString();
                }
                else
                {                   
                    JSONParsedProperty newProp = null;
                    string propName = (isArray == true) ? (arrayCtr++).ToString() : currentPropName;
                    bool existed = parent.Values.TryGetValue(propName, out newProp);

                    if (newProp == null)
                    {
                        newProp = new JSONParsedObject();
                    }

                    newProp.Parent = parent;
                    newProp.DataType = parent.DataType;
                    newProp.PropertyName = propName;

                    if (reader.TokenType == JsonTokenType.StartArray || reader.TokenType == JsonTokenType.StartObject)
                    {                       
                        newProp = Deserialize(ref reader, (JSONParsedObject)newProp);
                    }
                    else if (_valueTypeTokens.Contains(reader.TokenType) == true)
                    {
                        newProp.RawValue = reader.GetString();
                    }
                    else if (reader.TokenType == JsonTokenType.EndObject || reader.TokenType == JsonTokenType.EndArray)
                    {
                        break;
                    }

                    if (existed == false)
                    {
                        parent.Values.Add(propName, newProp);
                    }                    
                }
            }

            return parent;
        }

        private static JSONParseResult BuildObject(JSONParsedObject parsedObject)
        {
            if (parsedObject == null) return null;

            bool isRoot = parsedObject.Parent == null;
            bool isArray = (isRoot == true) ? parsedObject.DataType == JsonTokenType.StartArray : parsedObject.Parent.DataType == JsonTokenType.StartArray;

            List<ITestHierarchyContainer> rootObjects = new List<ITestHierarchyContainer>();
            if (isArray == true)
            {
                foreach (var parseResult in parsedObject.Values)
                {
                    if (parseResult.Value is JSONParsedObject objParse == false) continue;
                    if (objParse.Values.TryGetValue("type", out JSONParsedProperty typeVal) == false) continue;

                    string lowerType = typeVal.RawValue.ToLower();                   
                 
                    if (lowerType == "set")
                    {
                        var set = DeserializeTestHierarchyContainer(parseResult.Value, new TestSet());
                        if (set != null) rootObjects.Add(set);
                    }
                    else if (lowerType == "root")
                    {
                        var root = DeserializeTestHierarchyContainer(parseResult.Value, new TestRoot());
                        if (root != null)
                        {
                            rootObjects.Add(root);
                        }
                    }
                }
            }
            else
            {
                if (parsedObject.Values.TryGetValue("type", out JSONParsedProperty typeVal) == true)
                {
                    string lowerType = typeVal.RawValue.ToLower();

                    if (lowerType == "set")
                    {
                        var set = DeserializeTestHierarchyContainer(parsedObject, new TestSet());
                        if (set != null) rootObjects.Add(set);
                    }
                    else if (lowerType == "root")
                    {
                        var root = DeserializeTestHierarchyContainer(parsedObject, new TestRoot());
                        if (root != null)
                        {
                            rootObjects.Add(root);
                        }
                    }
                }
            }

            return new JSONParseResult()
            {
                Items = rootObjects,
                RootObject = parsedObject
            };
        }

        private static TestDependency DeserializeTestDependency(JSONParsedProperty parsedObject)
        {
            if (parsedObject == null) return null;

            TestDependency dependency = new TestDependency();

            if (parsedObject is JSONParsedObject obj)
            {
                foreach (var prop in obj.Values)
                {
                    if (prop.Value.DataType == JsonTokenType.Null) continue;

                    if (prop.Key == "name")
                    {
                        ValidateType(prop.Value, JsonTokenType.String, typeof(TestDependency));

                        dependency.Name = prop.Value.RawValue;                        
                    }
                    else if (dependency.Selector == null && (prop.Key == "path" || prop.Key == "selector"))
                    {
                        TestFileSelector selector = null;

                        if (prop.Key == "path")
                        {
                            if (obj.Values.TryGetValue("selector", out JSONParsedProperty selectorParseResult) == true)
                            {
                                selector = DeserializeTestFileSelector(selectorParseResult);
                                if (selector == null) selector = new TestFileSelector();

                                selector.Path = prop.Value.RawValue;

                            }
                            else
                            {
                                selector = new TestFileSelector();
                                selector.Path = prop.Value.RawValue; 
                            }
                        }
                        else if (prop.Key == "selector")
                        {
                            selector = DeserializeTestFileSelector(prop.Value);
                            if (obj.Values.TryGetValue("path", out JSONParsedProperty pathParseResult) == true)
                            {
                                if (selector == null) selector = new TestFileSelector();
                                selector.Path = pathParseResult.RawValue;
                            }

                            if (selector == null) selector = new TestFileSelector();
                        }          
                        
                        dependency.Selector = selector;
                    }
                    else if (prop.Key == "priority")
                    {
                        ValidateType(prop.Value, JsonTokenType.Number, typeof(TestDependency));

                        dependency.Priority = double.Parse(prop.Value.RawValue);                        
                    }
                }
            }
            else
            {
                if (parsedObject.DataType == JsonTokenType.String && String.IsNullOrWhiteSpace(parsedObject.RawValue) == false)
                {
                    var selector = new TestFileSelector();
                    selector.Name = parsedObject.RawValue;

                    dependency.Selector = selector;
                }
            }

            return dependency;
        }

        private static TestFileSelector DeserializeTestFileSelector(JSONParsedProperty parsedObject)
        {
            if (parsedObject == null) return null;
            if (parsedObject is JSONParsedObject obj == false) return null;

            var selector = new TestFileSelector();
            foreach (var prop in obj.Values)
            {
                if (prop.Value.DataType == JsonTokenType.Null) continue;

                if (prop.Key == "path")
                {
                    ValidateType(prop.Value, JsonTokenType.String, typeof(TestFileSelector));

                    selector.Path = prop.Value.RawValue;
                }
                else if (prop.Key == "glob")
                {
                    ValidateType(prop.Value, JsonTokenType.String, typeof(TestFileSelector));

                    selector.Glob = prop.Value.RawValue;
                }
                else if (prop.Key == "regex")
                {
                    ValidateType(prop.Value, JsonTokenType.String, typeof(TestFileSelector));

                    selector.Regex = prop.Value.RawValue;
                }
                else if (prop.Key == "name")
                {
                    ValidateType(prop.Value, JsonTokenType.String, typeof(TestFileSelector));

                    selector.Name = prop.Value.RawValue;
                }
                else if (prop.Key == "recursive")
                {
                    if(prop.Value.DataType != JsonTokenType.True && prop.Value.DataType != JsonTokenType.False && prop.Value.DataType != JsonTokenType.String)
                    {
                        throw new JSONParseException($"Error parsing {nameof(TestFileSelector)}: 'recursive' must evaluate to a boolean.", prop.Value);
                    }
                    else
                    {
                        if (prop.Value.DataType == JsonTokenType.True)
                        {
                            selector.Recursive = true;
                        }
                        else if (prop.Value.DataType == JsonTokenType.False)
                        {
                            selector.Recursive = false;
                        }
                        else if (prop.Value.DataType == JsonTokenType.String)
                        {
                            if (Boolean.TryParse(prop.Value.RawValue, out bool value) == false)
                            {
                                throw new JSONParseException($"Error parsing {nameof(TestFileSelector)}: 'recursive' must evaluate to a boolean.", prop.Value);
                            }
                            else
                            {
                                selector.Recursive = value;
                            }
                        }
                    }
                }
            }
            
            return selector;
        }

        private static List<TestDependency> DeserializeDependencies(JSONParsedObject dependenciesArray)
        {
            return null;
        }

        public static List<TestRunnable> DeserializeRunnables(JSONParsedObject runnablesArray)
        {
            var results = new List<TestRunnable>();
            if (runnablesArray == null) return results;

            return null;

        }

        private static ITestHierarchyContainer DeserializeTestHierarchyContainer(JSONParsedProperty parsedProp, ITestHierarchyContainer container)
        {
            if (parsedProp is JSONParsedObject obj == false || container == null) return null;

            TestSet set = null;
            TestRoot root = null;
            string itemName = null;
            Type itemType = null;

            bool isSet = container is TestSet;
            bool isRoot = container is TestRoot;

            if (isSet == true)
            {
                set = (TestSet)container;
                itemName = nameof(TestSet);
                itemType = typeof(TestSet);
            }
            else if (isRoot == true)
            {
                root = (TestRoot)container;
                itemName = nameof(TestRoot);
                itemType = typeof(TestRoot);
            }
            else
            {
                return container;
            }

            foreach (var property in obj.Values)
            {
                if (property.Value.DataType == JsonTokenType.Null) continue;

                if (property.Key == "name")
                {
                    ValidateType(property.Value, JsonTokenType.String, itemType);

                    container.Name = property.Value.RawValue;
                }
                else if (property.Key == "type")
                {
                    ValidateType(property.Value, JsonTokenType.String, itemType);

                    string lowerValue = property.Value.RawValue.ToLower();
                    if (isSet == true && lowerValue != "set")
                    {
                        throw new JSONParseException($"Error parsing {itemName}: 'type' must be \"set\".", property.Value);
                    }
                    else if (isRoot == true && lowerValue != "root")
                    {
                        throw new JSONParseException($"Error parsing {itemName}: 'type' must be \"root\".", property.Value);
                    }
                }
                else if (property.Key == "description")
                {
                    ValidateType(property.Value, JsonTokenType.String, itemType);

                    container.Description = property.Value.RawValue;                    
                }
                else if (property.Key == "dependencies")
                {
                    ValidateType(property.Value, JsonTokenType.StartArray, itemType);
                   
                    container.Dependencies = DeserializeDependencies((JSONParsedObject)property.Value);                    
                }
                else if (property.Key == "declarations" && isRoot)
                {
                    ValidateType(property.Value, JsonTokenType.StartObject, itemType);

                    root.Declarations = DeserializeTestRootDeclarationSet(property.Value as JSONParsedObject);                    
                }
                else if (property.Key == "recursive")
                {
                    if (property.Value.DataType != JsonTokenType.True && property.Value.DataType != JsonTokenType.False && property.Value.DataType != JsonTokenType.String)
                    {
                        throw new JSONParseException($"Error parsing {itemName}: 'recursive' must evaluate to a boolean.", property.Value);
                    }
                    else
                    {
                        if (property.Value.DataType == JsonTokenType.True)
                        {
                            container.Recursive = true;
                        }
                        else if (property.Value.DataType == JsonTokenType.False)
                        {
                            container.Recursive = false;
                        }
                        else if (property.Value.DataType == JsonTokenType.String)
                        {
                            if (Boolean.TryParse(property.Value.RawValue, out bool value) == false)
                            {
                                throw new JSONParseException($"Error parsing {itemName}: 'recursive' must evaluate to a boolean.", property.Value);
                            }
                            else
                            {
                                container.Recursive = value;
                            }
                        }
                    }
                }
                else if (property.Key == "failureMode" && isSet == true)
                {
                    ValidateType(property.Value, JsonTokenType.String, itemType);

                    string lowerValue = property.Value.RawValue.ToLower();
                    if (lowerValue == "continue")
                    {
                        set.FailureMode = TestFailureMode.Continue;
                    }
                    else if (lowerValue == "abandon")
                    {
                        set.FailureMode = TestFailureMode.Abandon;
                    }
                    else if (lowerValue == "terminate")
                    {
                        set.FailureMode = TestFailureMode.Terminate;
                    }
                    else
                    {
                        throw new JSONParseException($"Error parsing {itemName}: 'failureMode' must be one of the following: 'continue', 'abandon', or 'terminate'", property.Value);
                    }
                    
                }
                else if (property.Key == "run")
                {
                    if (property.Value is JSONParsedObject runArray)
                    {
                        container.Run = DeserializeRunnables(runArray);
                    }
                }
                else if (property.Key == "skip")
                {
                    if (property.Value is JSONParsedObject runArray)
                    {
                        container.Skip = DeserializeRunnables(runArray);
                    }
                }
                else if (property.Key == "version" && isRoot)
                {
                    ValidateType(property.Value, JsonTokenType.String, itemType);

                    root.Version = property.Value.RawValue;                    
                }
            }

            return container;
        }

        private static void ValidateType(JSONParsedProperty parseResult, JsonTokenType expectedType, Type objectType)
        {
            string itemName = objectType.Name;
            string expectedTypeName = null;
            if (expectedType == JsonTokenType.StartArray)
            {
                expectedTypeName = "array";
            }
            else if (expectedType == JsonTokenType.StartObject)
            {
                expectedTypeName = "object";
            }
            else
            {
                expectedTypeName = expectedType.ToString().ToLower();   
            }

            string message = $"Error parsing {itemName}: '{parseResult.PropertyName}' must be a {expectedType}.";

            throw new JSONParseException(message, parseResult);
        }

        private static TestRootDeclarationSet DeserializeTestRootDeclarationSet(JSONParsedProperty parsedObject)
        {

            return null;
        }

        private static TestRunnable DeserializeTestRunnable(JSONParsedProperty parsedObject)
        {

            return null;
        }
    }

    public class JSONParsedProperty
    {
        public JSONParsedProperty Parent { get; set; } = null;

        public string PropertyName { get; set; } = null;

        public string RawValue { get; set; } = null;

        public JsonTokenType DataType { get; set; } = JsonTokenType.None;
    }

    public class JSONParsedObject : JSONParsedProperty
    {
        public Dictionary<string, JSONParsedProperty> Values { get; } = new Dictionary<string, JSONParsedProperty>();
    }

    public class JSONParseResult
    {
        public JSONParsedObject RootObject { get; set; } = null;

        public List<ITestHierarchyContainer> Items { get; set; } = new List<ITestHierarchyContainer>();
    }

    public class JSONParseException : Exception
    {
        public JSONParsedProperty ParsedResult { get; } = null;

        public JSONParseException(string message, JSONParsedProperty parsedResult) 
            : base(GetErrorMessage(message, parsedResult)) 
        {
            ParsedResult = parsedResult;
        }

        private static string GetErrorMessage(string message, JSONParsedProperty parsedResult)
        {
            if (message == null) return null;
            if (parsedResult == null) return message;

            string parseErrorLocation = GetPropertyName(parsedResult);
            parsedResult = parsedResult.Parent;

            while (parsedResult.Parent != null)
            {
                parseErrorLocation = GetPropertyName(parsedResult) + "." + parseErrorLocation;
                parsedResult = parsedResult.Parent;
            }

            return message + "\nParse Error Location: " + parseErrorLocation;
        }

        private static string GetPropertyName(JSONParsedProperty parsedResult)
        {
            if (parsedResult == null) return "<null>";
            if (parsedResult.PropertyName == null && parsedResult.Parent == null) return "<root>";
            if (parsedResult.PropertyName == null) return "<unknown>";

            return parsedResult.PropertyName;   
        }
    }
}
