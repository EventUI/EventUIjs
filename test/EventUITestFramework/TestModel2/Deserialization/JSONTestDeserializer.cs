/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Net.WebSockets;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class JSONTestDeserializer
    {
        private Stack<string> _path = new Stack<string>();
        private static HashSet<JsonTokenType> _valueTypeTokens = new HashSet<JsonTokenType>() { JsonTokenType.String, JsonTokenType.Number, JsonTokenType.True, JsonTokenType.False, JsonTokenType.Null };

        public List<ITestHierarchyContainer> Deserialize(string json)
        {
            return Deserialize(new Span<byte>(Encoding.UTF8.GetBytes(json)));
        }

        public List<ITestHierarchyContainer> Deserialize(Span<byte> utf8Json)
        {
            Utf8JsonReader reader = new Utf8JsonReader(utf8Json, new JsonReaderOptions() { CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true });

            var firstToken = GetNextToken(ref reader);
            if (firstToken.TokenType != JsonTokenType.StartObject && firstToken.TokenType != JsonTokenType.StartArray) throw new Exception("Invalid JSON - must be a single object or an array.");

            List<ITestHierarchyContainer> containers = new List<ITestHierarchyContainer>();

            if (firstToken.TokenType == JsonTokenType.StartObject)
            {
                var deserialized = DeserializeHierarchyContainer(ref reader);
                if (deserialized != null) containers.Add(deserialized);
            }
            else if (firstToken.TokenType == JsonTokenType.StartArray)
            {
                TokenResult nextContainerStart = GetNextToken(ref reader);
                int objCtr = 0;
                while (nextContainerStart.TokenType != JsonTokenType.EndArray && nextContainerStart.TokenType != JsonTokenType.None)
                {
                    if (nextContainerStart.TokenType == JsonTokenType.StartObject)
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

        private ITestHierarchyContainer DeserializeHierarchyContainer(ref Utf8JsonReader reader)
        {
            ITestHierarchyContainer container = new TestSet(); //in general we will be making more test sets than test roots, so we start with a TestSet and will change to a
            bool isRoot = false;
            string type = null;

            TestRunnableType detectedType = TestRunnableType.None;
            TestSet set = (TestSet)container;
            TestRoot root = null;

            TokenResult nextToken = GetNextToken(ref reader);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
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

        private bool IsTokenValid(TokenResult nextToken)
        {
            return String.IsNullOrWhiteSpace(nextToken.PropertyName) == false && nextToken.TokenType != JsonTokenType.Null;
        }

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

        private TestRunnable DeserializeRunnable(ref Utf8JsonReader reader)
        {
            TestRunnable runnable = new TestRunnable();

            if (reader.TokenType == JsonTokenType.String)
            {
                runnable.Selector = new TestFileSelector();
                runnable.Selector.Name = reader.GetString();

                return runnable;
            }

            bool hasName = false;
            bool hasSelector = false;

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
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        selector.Path = GetString(nextToken.ValueData);
                        break;
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        selector.Name = GetString(nextToken.ValueData);
                        break;
                    case "glob":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        selector.Glob = GetString(nextToken.ValueData);
                        break;
                    case "regex":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency));

                        selector.Regex = GetString(nextToken.ValueData);
                        break;
                    case "recursive":

                        if (nextToken.TokenType != JsonTokenType.True && nextToken.TokenType != JsonTokenType.False)
                        {
                            ValidateType(nextToken, JsonTokenType.True, typeof(TestDependency));
                        }

                        selector.Recursive = BitConverter.ToBoolean(nextToken.ValueData);
                        break;
                }

                nextToken = GetNextToken(ref reader);
            }

            return selector;
        }

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
        
        private TokenResult GetNextToken(ref Utf8JsonReader reader)
        {
            if (reader.Read() == false)
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = JsonTokenType.None
                };
            }

            if (reader.TokenType == JsonTokenType.StartObject || reader.TokenType == JsonTokenType.StartArray)
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = reader.TokenType
                };
            }
            else if (reader.TokenType == JsonTokenType.PropertyName)
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
                        TokenType = reader.TokenType,
                        ValueData = reader.ValueSpan
                    };
                }
            }
            else if (_valueTypeTokens.Contains(reader.TokenType))
            {
                return new TokenResult()
                {
                    TokenType = reader.TokenType,
                    ValueData = reader.ValueSpan
                };
            }
            else
            {
                return new TokenResult()
                {
                    TokenType = reader.TokenType,
                };
            }
        }

        private string GetString(ReadOnlySpan<byte> utf8String)
        {
            return System.Text.Encoding.UTF8.GetString(utf8String);
        }

        public readonly ref struct TokenResult
        {
            public string PropertyName { get; init; }

            public JsonTokenType TokenType { get; init; }

            public ReadOnlySpan<byte> ValueData { get; init; }
        }

        public class JSONParseException : Exception
        {
            public JSONParseException(string message)
                : base(message)
            {
            }
        }
    }
}
