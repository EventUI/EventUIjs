using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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
                else if (reader.TokenType == JsonTokenType.StartArray || reader.TokenType == JsonTokenType.StartObject)
                {
                    if (currentPropName == null && isArray == false) continue;
                    var childParseResult = new JSONParsedObject()
                    {
                        Parent = parent,
                        PropertyName = (isArray) ? (arrayCtr++).ToString() : currentPropName,
                        DataType = reader.TokenType
                    };

                    var parseResult = Deserialize(ref reader, childParseResult);
                    parent.Values.Add(parseResult.PropertyName, parseResult);

                    currentPropName = null;
                }
                else if (_valueTypeTokens.Contains(reader.TokenType) == true)
                {
                    string propName = (isArray == true) ? (arrayCtr++).ToString() : currentPropName;
                    if (propName == null) continue;

                    var childProperty = new JSONParsedProperty()
                    {
                        Parent = parent,
                        DataType = reader.TokenType,
                        PropertyName = currentPropName,
                        RawValue = reader.GetString()
                    };

                    parent.Values.Add(currentPropName, childProperty);
                }
                else if (reader.TokenType == JsonTokenType.EndObject || reader.TokenType == JsonTokenType.EndArray)
                {
                    break;
                }
            }

            BuildObject(parent);
            return parent;
        }

        private static JSONParseResult BuildObject(JSONParsedObject parsedObject)
        {
            if (parsedObject == null) return null;

            bool isRoot = parsedObject.Parent == null;
            bool isArray = (isRoot == true) ? parsedObject.DataType == JsonTokenType.StartArray : parsedObject.Parent.DataType == JsonTokenType.StartArray;

            List<INamedRunnableItem> rootObjects = new List<INamedRunnableItem>();
            if (isArray == true)
            {
                foreach (var parseResult in parsedObject.Values)
                {
                    if (parseResult.Value is JSONParsedObject objParse == false) continue;
                    Type objectType = GetModelObjectType(objParse);

                    if (objectType == null) continue;
                    if (objectType == typeof(TestSet))
                    {
                        var set = DeserializeTestSet(parseResult.Value);
                        if (set != null)
                        {
                            rootObjects.Add(set);
                        }
                    }
                    else if (objectType == typeof(TestRoot))
                    {
                        var root = DeserializeTestRoot(parseResult.Value);
                        if (root != null)
                        {
                            rootObjects.Add(root);
                        }
                    }
                }
            }
            else
            {
                Type objectType = GetModelObjectType(parsedObject);
                if (objectType == typeof(TestSet))
                {
                    var set = DeserializeTestSet(parsedObject);
                    if (set != null)
                    {
                        rootObjects.Add(set);
                    }
                }
                else if (objectType == typeof(TestRoot))
                {
                    var root = DeserializeTestRoot(parsedObject);
                    if (root != null)
                    {
                        rootObjects.Add(root);
                    }
                }
            }

            return new JSONParseResult()
            {
                Items = rootObjects,
                RootObject = parsedObject
            };
        }

        private static Type GetModelObjectType(JSONParsedObject parsedObject)
        {
            if (parsedObject == null) return null;
            string parentObjectName = parsedObject.Parent?.PropertyName;

            if (parsedObject.Values.TryGetValue("type", out JSONParsedProperty parseResult) == true)
            {
                bool couldBeRunnable = parentObjectName == "run" || parentObjectName == "skip";
                if (parseResult.RawValue == "set")
                {
                    return (couldBeRunnable == true) ? typeof(TestRunnable) : typeof(TestSet);
                }
                else if (parseResult.RawValue == "root")
                {
                    return (couldBeRunnable == true) ? typeof(TestRunnable) : typeof(TestRoot);
                }
            }
            else if (parentObjectName == "dependencies")
            {
                return typeof(TestDependency);
            }
            else if (parentObjectName == "declarations")
            {
                return typeof(TestRootDeclarationSet);
            }
            else if (parsedObject.PropertyName == "selector")
            {
                return typeof(TestFileSelector);
            }

            return null;
        }

        private static TestDependency DeserializeTestDependency(JSONParsedProperty parsedObject)
        {

            return null;
        }

        private static TestFileSelector DeserializeTestFileSelector(JSONParsedProperty parsedObject)
        {

            return null;
        }

        private static TestRoot DeserializeTestRoot(JSONParsedProperty parsedObject)
        {

            return null;
        }

        private static TestSet DeserializeTestSet(JSONParsedProperty parsedProp)
        {
            if (parsedProp is JSONParsedObject obj == false) return null;
            var testSet = new TestSet();

            return null;
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

        public List<INamedRunnableItem> Items { get; set; } = new List<INamedRunnableItem>();
    }
}
