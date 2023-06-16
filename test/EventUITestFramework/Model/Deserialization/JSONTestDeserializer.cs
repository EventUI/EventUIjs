/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System.Text;
using System.Text.Json;

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// Utility class designed to deserialize JSON files that contain TestRoot and TestSet objects.
    /// </summary>
    public class JSONTestDeserializer
    {
        private Stack<string> _path = new Stack<string>(new string[] {"<root>"}); //used for keeping track of the "path" from the root of the json object to a property (used in error reporting)
        private static HashSet<JsonTokenType> _valueTypeTokens = new HashSet<JsonTokenType>() { JsonTokenType.String, JsonTokenType.Number, JsonTokenType.True, JsonTokenType.False, JsonTokenType.Null };

        /// <summary>
        /// Deserializes a JSON string into a list of ITestHierarchyContainer-implementing types.
        /// </summary>
        /// <param name="json">The JSON string to deserialize.</param>
        /// <returns></returns>
        public List<ITestHierarchyContainer> Deserialize(string json)
        {
            return Deserialize(new Span<byte>(Encoding.UTF8.GetBytes(json)));
        }

        /// <summary>
        /// Deserializes a buffer containing a UTF8 JSON string into a list of ITestHierarchyContainer-implementing types.
        /// </summary>
        /// <param name="json">The JSON buffer to deserialize.</param>
        /// <returns></returns>
        public List<ITestHierarchyContainer> Deserialize(Span<byte> utf8Json)
        {
            Utf8JsonReader reader = new Utf8JsonReader(utf8Json, new JsonReaderOptions() { CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true });

            //get the first token and make sure that it signals the start of an object or an array (of objects). If it's anything else the JSON is invalid.
            var firstToken = GetNextToken(ref reader);
            if (firstToken.TokenType != JsonTokenType.StartObject && firstToken.TokenType != JsonTokenType.StartArray) throw new Exception("Invalid JSON - must be a single object or an array.");

            List<ITestHierarchyContainer> containers = new List<ITestHierarchyContainer>();

           
            if (firstToken.TokenType == JsonTokenType.StartObject) //we have just one item
            {
                var deserialized = DeserializeHierarchyContainer(ref reader);
                if (deserialized != null) containers.Add(deserialized);
            }
            else if (firstToken.TokenType == JsonTokenType.StartArray) //we have an array of items. Get tokens until we get to the end of the array.
            {
                TokenResult nextContainerStart = GetNextToken(ref reader);

                int objCtr = 0;
                while (nextContainerStart.TokenType != JsonTokenType.EndArray && nextContainerStart.TokenType != JsonTokenType.None)
                {
                    if (nextContainerStart.TokenType == JsonTokenType.StartObject) //only objects are relevant, so anything else in the array is discardrd
                    {
                        _path.Push(objCtr.ToString());
                        var deserialized = DeserializeHierarchyContainer(ref reader);
                        if (deserialized != null)
                        {
                            containers.Add(deserialized);
                        }

                        objCtr++;
                        _path.Pop();
                    }

                    nextContainerStart = GetNextToken(ref reader);
                }
            }

            return containers;
        }

        /// <summary>
        /// Deserializes an unknown JSON stream into either a TestSet or a TestRoot
        /// </summary>
        /// <param name="reader">The JSON reader seeked to the "BeginObject" token of a TestSet or TestRoot object.</param>
        /// <returns></returns>
        /// <exception cref="JSONParseException"></exception>
        private ITestHierarchyContainer DeserializeHierarchyContainer(ref Utf8JsonReader reader)
        {
            //basically in the code below we have to populate a TestSet or a TestRoot - the problem is we don't know which we are using until we either get to a key property found in one but not the other
            //type, so we default to a TestSet and transform the object to a TestRoot if needed (there SHOULD be more sets than roots in any given hierarchy).
            ITestHierarchyContainer container = new TestSet(); 
            bool isRoot = false;
            string type = null;


            TestRunnableType detectedType = TestRunnableType.None;
            TestSet set = (TestSet)container;
            TestRoot root = null;

            TokenResult nextToken = GetNextToken(ref reader);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false) //token had no value or no property name, skip
                {
                    nextToken = GetNextToken(ref reader);
                }

                switch (nextToken.PropertyName)
                {
                    case "version":
                        if (type == null || type == "root")
                        {
                            if (isRoot == false)
                            {
                                container = TestRoot.FromSet(set);
                                root = (TestRoot)container;
                                isRoot = true;
                            }

                            ValidateType(nextToken, JsonTokenType.String, container.GetType());

                            root.Version = GetString(nextToken.ValueData);
                        }

                        break;

                    case "declarations":

                        if (type == null || type == "root")
                        {
                            if (isRoot == false)
                            {
                                container = TestRoot.FromSet(set);
                                root = (TestRoot)container;
                                isRoot = true;
                            }

                            ValidateType(nextToken, JsonTokenType.StartObject, container.GetType());

                            _path.Push(nextToken.PropertyName);
                            root.Declarations = DeserializeDeclarationSet(ref reader);
                            _path.Pop();
                        }

                        break;

                    case "type":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType());

                        type = GetString(nextToken.ValueData).ToLower();
                        if (type != "set" && type != "root") throw new JSONParseException($"Invalid object - 'type' property value must be 'root' or 'set'.\nError at: {GetPath(_path)}");

                        //validate that a "type" property was present and it was one of our values. If not, we're deserialzing some unknown object.
                        if (detectedType == TestRunnableType.None)
                        {
                            if (type == "set")
                            {
                                detectedType = TestRunnableType.Set;
                            }
                            else if (type == "root")
                            {
                                detectedType = TestRunnableType.Root;
                            }
                        }

                        if (isRoot == true && type != "root")
                        {
                            throw new JSONParseException($"Invalid object - TestRoot properties detected but type designates the object to be {type}.");
                        }
                        else
                        {
                            if (type == "root" && isRoot == false)
                            {
                                container = TestRoot.FromSet(set);
                                root = (TestRoot)container;
                                isRoot = true;
                            }
                        }

                        break;

                    case "failureMode":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType());

                        if (isRoot == false && (type == null || type == "set"))
                        {
                            string failureMode = GetString(nextToken.ValueData).ToLower();

                            var enumValue = Enum.Parse(typeof(TestFailureMode), failureMode, true);
                            if (enumValue == null)
                            {
                                throw new JSONParseException($"Invalid failureMode - must be 'continue', 'abandon', or 'terminate'.\nError at: {GetPath(_path)}");
                            }
                            else
                            {
                                set.FailureMode = (TestFailureMode)enumValue;
                            }
                        }

                        break;

                    case "name":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType());

                        container.Name = GetString(nextToken.ValueData);
                        break;

                    case "description":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType());

                        container.Description = GetString(nextToken.ValueData);
                        break;

                    case "dependencies":
                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType());

                        _path.Push(nextToken.PropertyName);
                        container.Dependencies = DeserializeDependenciesList(ref reader, true);
                        _path.Pop();
                        break;

                    case "recursive":

                        if (nextToken.TokenType != JsonTokenType.True && nextToken.TokenType != JsonTokenType.False)
                        {
                            ValidateType(nextToken, JsonTokenType.True, container.GetType());
                        }

                        container.Recursive = BitConverter.ToBoolean(nextToken.ValueData);
                        break;

                    case "run":

                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType());
                        _path.Push(nextToken.PropertyName);
                        container.Run = DeserializeRunnablesList(ref reader);
                        _path.Pop();
                        break;


                    case "skip":

                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType());

                        _path.Push(nextToken.PropertyName);
                        container.Skip = DeserializeRunnablesList(ref reader);
                        _path.Pop();
                        break;

                }

                nextToken = GetNextToken(ref reader);
            }

            //if we never ran into a valid "type" property, this isn't one of our objects.
            if (detectedType == TestRunnableType.None) return null;

            return container;
        }

        /// <summary>
        /// Determines if a token is "valid" by means of having both a property name and value.
        /// </summary>
        /// <param name="token">The token to check for validity.</param>
        /// <returns></returns>
        private bool IsTokenValid(TokenResult token)
        {
            return String.IsNullOrWhiteSpace(token.PropertyName) == false && token.TokenType != JsonTokenType.Null;
        }

        /// <summary>
        /// Deserializes a list of TestRunnable objects.
        /// </summary>
        /// <param name="reader">The reader that is advanced to a position of "BeginArray" or "BeginObject" of a TestRunnables list.</param>
        /// <returns></returns>
        private List<TestRunnable> DeserializeRunnablesList(ref Utf8JsonReader reader)
        {
            List<TestRunnable> runnables = new List<TestRunnable>();

            TokenResult nextToken = GetNextToken(ref reader);
            int objCounter = 0;
            while (nextToken.TokenType != JsonTokenType.EndArray && nextToken.TokenType != JsonTokenType.None)
            {
                if (nextToken.TokenType == JsonTokenType.StartObject)
                {
                    _path.Push(objCounter.ToString());
                    var dependency = DeserializeRunnable(ref reader);
                    if (dependency != null)
                    {
                        runnables.Add(dependency);
                    }

                    objCounter++;
                    _path.Pop();
                }
                else if (nextToken.TokenType == JsonTokenType.String)
                {
                    _path.Push(objCounter.ToString());
                    var dependency = DeserializeRunnable(ref reader);
                    if (dependency != null)
                    {
                        runnables.Add(dependency);
                    }

                    objCounter++;
                    _path.Pop();
                }

                nextToken = GetNextToken(ref reader);
            }

            return runnables;
        }

        /// <summary>
        /// Deserializes a TestRunnable object.
        /// </summary>
        /// <param name="reader">The reader to deserialize the Runnable from.</param>
        /// <returns></returns>
        /// <exception cref="JSONParseException"></exception>
        private TestRunnable DeserializeRunnable(ref Utf8JsonReader reader)
        {
            TestRunnable runnable = new TestRunnable();

            if (reader.TokenType == JsonTokenType.String) //if the reader is at a string, we have the "name" of a runnable to use but nothing more
            {
                runnable.Selector = new TestFileSelector();
                runnable.Selector.Name = reader.GetString();

                return runnable;
            }

            bool hasName = false;
            bool hasSelector = false;

            //if we weren't at a string, try and build a runnable object.
            TokenResult nextToken = GetNextToken(ref reader);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref reader);
                }

                switch (nextToken.PropertyName)
                {
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable));

                        hasName = true;
                        if (hasSelector == false)
                        {
                            runnable.Selector = new TestFileSelector();
                            runnable.Selector.Name = GetString(nextToken.ValueData);

                            hasSelector = true;
                        }
                        else
                        {
                            runnable.Selector.Name = GetString(nextToken.ValueData);
                        }

                        break;
                    case "type":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable));

                        string value = GetString(nextToken.ValueData).ToLower();
                        if (value != "set" && value != "file")
                        {
                            throw new JSONParseException($"Invalid object - 'type' property value must be 'file' or 'set'.\nError at: {GetPath(_path)}");
                        }
                        else
                        {
                            runnable.Type = (value == "set") ? TestRunnableType.Set : TestRunnableType.File;
                        }

                        break;

                    case "selector":
                        ValidateType(nextToken, JsonTokenType.StartObject, typeof(TestRunnable));

                        _path.Push(nextToken.PropertyName);
                        TestFileSelector selector = DeserializeFileSelector(ref reader);
                        _path.Pop();

                        if (hasSelector == true && hasName == true) selector.Name = runnable.Selector.Name;                        
                        runnable.Selector = selector;

                        break;

                    case "failureMode":

                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable));

                        string failureMode = GetString(nextToken.ValueData).ToLower();

                        var enumValue = Enum.Parse(typeof(TestFailureMode), failureMode, true);
                        if (enumValue == null)
                        {
                            throw new JSONParseException($"Invalid failureMode - must be 'continue', 'abandon', or 'terminate'.\nError at: {GetPath(_path)}");
                        }
                        else
                        {
                            runnable.FailureMode = (TestFailureMode)enumValue;
                        }                        

                        break;
                }

                nextToken = GetNextToken(ref reader);
            }

            return runnable;
        }

        /// <summary>
        /// Deserializes a DeclarationSet of items found in a TestRoot.
        /// </summary>
        /// <param name="reader">THe JSON reader advanced to BeginObject.</param>
        /// <returns></returns>
        private TestRootDeclarationSet DeserializeDeclarationSet(ref Utf8JsonReader reader)
        {
            TestRootDeclarationSet declarationSet = new TestRootDeclarationSet();
            TokenResult nextToken = GetNextToken(ref reader);

            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref reader);
                }

                switch (nextToken.PropertyName)
                {
                    case "dependencies":

                        ValidateType(nextToken, JsonTokenType.StartArray, typeof(TestRootDeclarationSet));

                        _path.Push(nextToken.PropertyName);
                        declarationSet.Dependencies = DeserializeDependenciesList(ref reader, false);
                        _path.Pop();

                        break;
                }

                nextToken = GetNextToken(ref reader);
            }

            return declarationSet;
        }

        /// <summary>
        /// Deserializes a list of TestDependency objects.
        /// </summary>
        /// <param name="reader">The JSON reader advanced to a StartArray position.</param>
        /// <param name="stringsAllowed">Whether or not a dependency can be referenced by string name along in this array (rather than be an object).</param>
        /// <returns></returns>
        private List<TestDependency> DeserializeDependenciesList(ref Utf8JsonReader reader, bool stringsAllowed)
        {
            List<TestDependency> dependencies = new List<TestDependency>();

            TokenResult nextToken = GetNextToken(ref reader);
            int objCounter = 0;
            while (nextToken.TokenType != JsonTokenType.EndArray && nextToken.TokenType != JsonTokenType.None)
            {
                if (nextToken.TokenType == JsonTokenType.StartObject)
                {
                    _path.Push(objCounter.ToString());
                    var dependency = DeserializeDependency(ref reader);
                    if (dependency != null)
                    {
                        dependencies.Add(dependency);
                    }

                    objCounter++;
                    _path.Pop();
                }
                else if (nextToken.TokenType == JsonTokenType.String && stringsAllowed == true)
                {
                    _path.Push(objCounter.ToString());
                    var dependency = DeserializeDependency(ref reader);
                    if (dependency != null)
                    {
                        dependencies.Add(dependency);
                    }

                    objCounter++;
                    _path.Pop();
                }

                nextToken = GetNextToken(ref reader);
            }

            return dependencies;
        }

        /// <summary>
        /// Deserializes a TestDependency object.
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        private TestDependency DeserializeDependency(ref Utf8JsonReader reader)
        {
            TestDependency dependency = new TestDependency();
            bool hasSelector = false;
            bool hasPath = false;
            if (reader.TokenType == JsonTokenType.String)
            {
                dependency.Selector = new TestFileSelector();
                dependency.Selector.Name = reader.GetString();

                return dependency;
            }

            TokenResult nextToken = GetNextToken(ref reader);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref reader);
                }

                switch (nextToken.PropertyName)
                {
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        dependency.Name = GetString(nextToken.ValueData);
                        break;
                    case "path":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        hasPath = true;

                        if (hasSelector == false)
                        {
                            dependency.Selector = new TestFileSelector();
                            dependency.Selector.Path = GetString(nextToken.ValueData);
                            hasSelector = true;
                        }
                        else
                        {
                            dependency.Selector.Path = GetString(nextToken.ValueData);
                        }

                        break;
                    case "priority":
                        ValidateType(nextToken, JsonTokenType.Number, typeof(TestDependency));

                        dependency.Priority = reader.GetDouble();
                        break;
                    case "selector":
                        ValidateType(nextToken, JsonTokenType.StartObject, typeof(TestDependency));

                        _path.Push(nextToken.PropertyName);
                        TestFileSelector selector = DeserializeFileSelector(ref reader);
                        _path.Pop();

                        if (selector != null)
                        {
                            if (hasSelector == true)
                            {
                                if (hasPath == false || String.IsNullOrEmpty(dependency.Selector.Path)) dependency.Selector.Path = selector.Path;
                                dependency.Selector.Name = selector.Name;
                                dependency.Selector.Recursive = selector.Recursive;
                                dependency.Selector.Glob = selector.Glob;
                                dependency.Selector.Regex = selector.Regex;
                            }
                            else
                            {
                                dependency.Selector = selector;
                            }
                        }

                        break;
                }

                nextToken = GetNextToken(ref reader);
            }

            return dependency;
        }

        /// <summary>
        /// Deserializes a TestFileSelector object.
        /// </summary>
        /// <param name="reader">A JSON reader advanced to BeginObject.</param>
        /// <returns></returns>
        private TestFileSelector DeserializeFileSelector(ref Utf8JsonReader reader)
        {
            TestFileSelector selector = new TestFileSelector();

            TokenResult nextToken = GetNextToken(ref reader);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref reader);
                }

                switch (nextToken.PropertyName)
                {
                    case "path":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestFileSelector));

                        selector.Path = GetString(nextToken.ValueData);
                        break;
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestFileSelector));

                        selector.Name = GetString(nextToken.ValueData);
                        break;
                    case "glob":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestFileSelector));

                        selector.Glob = GetString(nextToken.ValueData);
                        break;
                    case "regex":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestFileSelector));

                        selector.Regex = GetString(nextToken.ValueData);
                        break;
                    case "recursive":

                        if (nextToken.TokenType != JsonTokenType.True && nextToken.TokenType != JsonTokenType.False)
                        {
                            ValidateType(nextToken, JsonTokenType.True, typeof(TestFileSelector));
                        }

                        selector.Recursive = BitConverter.ToBoolean(nextToken.ValueData);
                        break;
                }

                nextToken = GetNextToken(ref reader);
            }

            return selector;
        }

        /// <summary>
        /// Validates that a TokenResult contains a value of the expected token type.
        /// </summary>
        /// <param name="parseResult"></param>
        /// <param name="expectedType"></param>
        /// <param name="objectType"></param>
        /// <exception cref="JSONParseException"></exception>
        private void ValidateType(TokenResult parseResult, JsonTokenType expectedType, Type objectType)
        {
            if (parseResult.TokenType == expectedType)
            {
                return;
            }

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
            else if (expectedType == JsonTokenType.True || expectedType == JsonTokenType.False)
            {
                expectedTypeName = "boolean";
            }
            else
            {
                expectedTypeName = expectedType.ToString().ToLower();
            }

            string pathStr = GetPath(_path);

            string message = $"Error parsing {itemName}: '{parseResult.PropertyName}' must be of type '{expectedTypeName}'.\nError at: {pathStr}";

            throw new JSONParseException(message);
        }

        private static string GetPath(Stack<string> path)
        {
            string pathStr = "";
            foreach (string seg in path)
            {
                if (pathStr == "")
                {
                    pathStr = seg;
                }
                else
                {
                    pathStr = pathStr + "." + seg;
                }
            }

            return pathStr;
        }     
        
        /// <summary>
        /// Gets the next "Token" from the JSON reader by advancing to a property name, then advancing to the position afterwards to get the value type and (if not an object) the value span.
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        private TokenResult GetNextToken(ref Utf8JsonReader reader)
        {
            if (reader.Read() == false) //ran out of stuff to read, all done
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = JsonTokenType.None
                };
            }

            if (reader.TokenType == JsonTokenType.StartObject || reader.TokenType == JsonTokenType.StartArray) //reader came to a start object/array before coming to a property name, its likely a root object or an array member
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = reader.TokenType
                };
            }
            else if (reader.TokenType == JsonTokenType.PropertyName) //we have a property - get its name, advance one token, and get its value/value token type
            {
                string propertyName = reader.GetString();
                reader.Read();

                if (_valueTypeTokens.Contains(reader.TokenType))
                {
                    return new TokenResult()
                    {
                        PropertyName = propertyName,
                        TokenType = reader.TokenType,
                        ValueData = reader.ValueSpan
                    };
                }
                else
                {
                    return new TokenResult()
                    {
                        PropertyName = propertyName,
                        TokenType = reader.TokenType
                    };
                }
            }
            else if (_valueTypeTokens.Contains(reader.TokenType)) //if the token was just a value, it's a member of an array
            {
                return new TokenResult()
                {
                    TokenType = reader.TokenType,
                    ValueData = reader.ValueSpan
                };
            }
            else //otherwise just return the token type
            {
                return new TokenResult()
                {
                    TokenType = reader.TokenType,
                };
            }
        }

        /// <summary>
        /// Gets a string from a ReadOnlySpan of UTF-8 bytes.
        /// </summary>
        /// <param name="utf8String"></param>
        /// <returns></returns>
        private string GetString(ReadOnlySpan<byte> utf8String)
        {
            return System.Text.Encoding.UTF8.GetString(utf8String);
        }

        /// <summary>
        /// Special struct for extracting the values from the JSON reader more easily.
        /// </summary>
        public readonly ref struct TokenResult
        {
            /// <summary>
            /// If this result represents a property, this is the property's name.
            /// </summary>
            public string PropertyName { get; init; }

            /// <summary>
            /// This is the type of token the reader was advanced to.
            /// </summary>
            public JsonTokenType TokenType { get; init; }

            /// <summary>
            /// If this was a property with a non-object value, this is the value of the data.
            /// </summary>
            public ReadOnlySpan<byte> ValueData { get; init; }
        }

        /// <summary>
        /// Exception thrown when the JSONTestDeserializer encounters an error in the JSON being parsed.
        /// </summary>
        public class JSONParseException : Exception
        {
            public JSONParseException(string message)
                : base(message)
            {
            }
        }
    }
}
