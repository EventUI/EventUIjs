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
    public class JSONTestDeserializer2
    {
        private static HashSet<JsonTokenType> _valueTypeTokens = new HashSet<JsonTokenType>() { JsonTokenType.String, JsonTokenType.Number, JsonTokenType.True, JsonTokenType.False, JsonTokenType.Null };
        private static HashSet<string> _testRootProperties = new HashSet<string>() { "version", "declarations" }; //the names of the properties that only TestRoot objects have,

        public List<ITestHierarchyContainer> Deserialize(string json)
        {
            return Deserialize(new Span<byte>(Encoding.UTF8.GetBytes(json)));
        }

        public List<ITestHierarchyContainer> Deserialize(Span<byte> utf8Json)
        {
            Utf8JsonReader reader = new Utf8JsonReader(utf8Json, new JsonReaderOptions() { CommentHandling = JsonCommentHandling.Skip, AllowTrailingCommas = true });
            TokenParseState state = new TokenParseState()
            {
                Path = new Stack<string>(new string[] { "<root>" }),
                Reader = reader
            };

            var firstToken = GetNextToken(ref state);

            if (firstToken.TokenType != JsonTokenType.StartObject && firstToken.TokenType != JsonTokenType.StartArray) throw new Exception("Invalid JSON - must be a single object or an array.");

            List<ITestHierarchyContainer> containers = new List<ITestHierarchyContainer>();

            if (firstToken.TokenType == JsonTokenType.StartObject)
            {
                var deserialized = DeserializeHierarchyContainer(ref state);
                if (deserialized != null) containers.Add(deserialized);
            }
            else if (firstToken.TokenType == JsonTokenType.StartArray)
            {
                TokenResult nextContainerStart = GetNextToken(ref state);
                int objCtr = 0;
                while (nextContainerStart.TokenType != JsonTokenType.EndArray && nextContainerStart.TokenType != JsonTokenType.None)
                {
                    if (nextContainerStart.TokenType == JsonTokenType.StartObject)
                    {
                        state.Path.Push(objCtr.ToString());
                        var deserialized = DeserializeHierarchyContainer(ref state);
                        if (deserialized != null)
                        {
                            containers.Add(deserialized);
                        }

                        objCtr++;
                        state.Path.Pop();
                    }

                    nextContainerStart = GetNextToken(ref state);
                }
            }

            return containers;
        }

        private ITestHierarchyContainer DeserializeHierarchyContainer(ref TokenParseState state)
        {
            ITestHierarchyContainer container = new TestSet(); //in general we will be making more test sets than test roots, so we start with a TestSet and will change to a
            bool isRoot = false;
            string type = null;

            TestSet set = (TestSet)container;
            TestRoot root = null;

            TokenResult nextToken = GetNextToken(ref state);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref state);
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

                            ValidateType(nextToken, JsonTokenType.String, container.GetType(), state.Path);

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

                            ValidateType(nextToken, JsonTokenType.StartObject, container.GetType(), state.Path);

                            state.Path.Push(nextToken.PropertyName);
                            root.Declarations = DeserializeDeclarationSet(ref state);
                            state.Path.Pop();
                        }

                        break;

                    case "type":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType(), state.Path);

                        type = GetString(nextToken.ValueData).ToLower();
                        if (type != "set" && type != "root") throw new JSONParseException($"Invalid object - 'type' property value must be 'root' or 'set'.\nError at: {GetPath(state.Path)}");

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

                        ValidateType(nextToken, JsonTokenType.String, container.GetType(), state.Path);

                        if (isRoot == false && (type == null || type == "set"))
                        {
                            string failureMode = GetString(nextToken.ValueData).ToLower();

                            var enumValue = Enum.Parse(typeof(TestFailureMode), failureMode, true);
                            if (enumValue == null)
                            {
                                throw new JSONParseException($"Invalid failureMode - must be 'continue', 'abandon', or 'terminate'.\nError at: {GetPath(state.Path)}");
                            }
                            else
                            {
                                set.FailureMode = (TestFailureMode)enumValue;
                            }
                        }

                        break;

                    case "name":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType(), state.Path);

                        container.Name = GetString(nextToken.ValueData);
                        break;

                    case "description":

                        ValidateType(nextToken, JsonTokenType.String, container.GetType(), state.Path);

                        container.Description = GetString(nextToken.ValueData);
                        break;

                    case "dependencies":
                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType(), state.Path);

                        state.Path.Push(nextToken.PropertyName);
                        container.Dependencies = DeserializeDependenciesList(ref state, true);
                        state.Path.Pop();
                        break;

                    case "recursive":

                        if (nextToken.TokenType != JsonTokenType.True && nextToken.TokenType != JsonTokenType.False)
                        {
                            ValidateType(nextToken, JsonTokenType.True, container.GetType(), state.Path);
                        }

                        container.Recursive = BitConverter.ToBoolean(nextToken.ValueData);
                        break;

                    case "run":

                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType(), state.Path);
                        state.Path.Push(nextToken.PropertyName);
                        container.Run = DeserializeRunnablesList(ref state);
                        state.Path.Pop();
                        break;


                    case "skip":

                        ValidateType(nextToken, JsonTokenType.StartArray, container.GetType(), state.Path);

                        state.Path.Push(nextToken.PropertyName);
                        container.Skip = DeserializeRunnablesList(ref state);
                        state.Path.Pop();
                        break;

                }

                nextToken = GetNextToken(ref state);
            }


            return container;
        }

        private bool IsTokenValid(TokenResult nextToken)
        {
            return String.IsNullOrWhiteSpace(nextToken.PropertyName) == false && nextToken.TokenType != JsonTokenType.Null;
        }

        private List<TestRunnable> DeserializeRunnablesList(ref TokenParseState state)
        {
            List<TestRunnable> runnables = new List<TestRunnable>();

            TokenResult nextToken = GetNextToken(ref state);
            int objCounter = 0;
            while (nextToken.TokenType != JsonTokenType.EndArray && nextToken.TokenType != JsonTokenType.None)
            {
                if (nextToken.TokenType == JsonTokenType.StartObject)
                {
                    state.Path.Push(objCounter.ToString());
                    var dependency = DeserializeRunnable(ref state);
                    if (dependency != null)
                    {
                        runnables.Add(dependency);
                    }

                    objCounter++;
                    state.Path.Pop();
                }
                else if (nextToken.TokenType == JsonTokenType.String)
                {
                    state.Path.Push(objCounter.ToString());
                    var dependency = DeserializeRunnable(ref state);
                    if (dependency != null)
                    {
                        runnables.Add(dependency);
                    }

                    objCounter++;
                    state.Path.Pop();
                }

                nextToken = GetNextToken(ref state);
            }

            return runnables;
        }

        private TestRunnable DeserializeRunnable(ref TokenParseState state)
        {
            TestRunnable runnable = new TestRunnable();

            if (state.Reader.TokenType == JsonTokenType.String)
            {
                runnable.Selector = new TestFileSelector();
                runnable.Selector.Name = state.Reader.GetString();

                return runnable;
            }

            bool hasName = false;
            bool hasSelector = false;

            TokenResult nextToken = GetNextToken(ref state);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref state);
                }

                switch (nextToken.PropertyName)
                {
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable), state.Path);

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
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable), state.Path);

                        string value = GetString(nextToken.ValueData).ToLower();
                        if (value != "set" || value != "file")
                        {
                            throw new JSONParseException($"Invalid object - 'type' property value must be 'file' or 'set'.\nError at: {GetPath(state.Path)}");
                        }
                        else
                        {
                            runnable.Type = (value == "set") ? TestRunnableType.Set : TestRunnableType.File;
                        }

                        break;

                    case "selector":
                        ValidateType(nextToken, JsonTokenType.StartObject, typeof(TestRunnable), state.Path);

                        state.Path.Push(nextToken.PropertyName);
                        TestFileSelector selector = DeserializeFileSelector(ref state);
                        state.Path.Pop();

                        if (hasSelector == true && hasName == true) selector.Name = runnable.Selector.Name;                        
                        runnable.Selector = selector;

                        break;

                    case "failureMode":

                        ValidateType(nextToken, JsonTokenType.String, typeof(TestRunnable), state.Path);

                        string failureMode = GetString(nextToken.ValueData).ToLower();

                        var enumValue = Enum.Parse(typeof(TestFailureMode), failureMode, true);
                        if (enumValue == null)
                        {
                            throw new JSONParseException($"Invalid failureMode - must be 'continue', 'abandon', or 'terminate'.\nError at: {GetPath(state.Path)}");
                        }
                        else
                        {
                            runnable.FailureMode = (TestFailureMode)enumValue;
                        }                        

                        break;
                }

                nextToken = GetNextToken(ref state);
            }

            return runnable;
        }

        private TestRootDeclarationSet DeserializeDeclarationSet(ref TokenParseState state)
        {
            TestRootDeclarationSet declarationSet = new TestRootDeclarationSet();
            TokenResult nextToken = GetNextToken(ref state);

            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref state);
                }

                switch (nextToken.PropertyName)
                {
                    case "dependencies":

                        ValidateType(nextToken, JsonTokenType.StartArray, typeof(TestRootDeclarationSet), state.Path);

                        state.Path.Push(nextToken.PropertyName);
                        declarationSet.Dependencies = DeserializeDependenciesList(ref state, false);
                        state.Path.Pop();

                        break;
                }

                nextToken = GetNextToken(ref state);
            }

            return declarationSet;
        }

        private List<TestDependency> DeserializeDependenciesList(ref TokenParseState state, bool stringsAllowed)
        {
            List<TestDependency> dependencies = new List<TestDependency>();

            TokenResult nextToken = GetNextToken(ref state);
            int objCounter = 0;
            while (nextToken.TokenType != JsonTokenType.EndArray && nextToken.TokenType != JsonTokenType.None)
            {
                if (nextToken.TokenType == JsonTokenType.StartObject)
                {
                    state.Path.Push(objCounter.ToString());
                    var dependency = DeserializeDependency(ref state);
                    if (dependency != null)
                    {
                        dependencies.Add(dependency);
                    }

                    objCounter++;
                    state.Path.Pop();
                }
                else if (nextToken.TokenType == JsonTokenType.String && stringsAllowed == true)
                {
                    state.Path.Push(objCounter.ToString());
                    var dependency = DeserializeDependency(ref state);
                    if (dependency != null)
                    {
                        dependencies.Add(dependency);
                    }

                    objCounter++;
                    state.Path.Pop();
                }

                nextToken = GetNextToken(ref state);
            }

            return dependencies;
        }

        private TestDependency DeserializeDependency(ref TokenParseState state)
        {
            TestDependency dependency = new TestDependency();
            bool hasSelector = false;
            bool hasPath = false;
            if (state.Reader.TokenType == JsonTokenType.String)
            {
                dependency.Selector = new TestFileSelector();
                dependency.Selector.Name = state.Reader.GetString();

                return dependency;
            }

            TokenResult nextToken = GetNextToken(ref state);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref state);
                }

                switch (nextToken.PropertyName)
                {
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

                        dependency.Name = GetString(nextToken.ValueData);
                        break;
                    case "path":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

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
                        ValidateType(nextToken, JsonTokenType.Number, typeof(TestDependency), state.Path);

                        dependency.Priority = BitConverter.ToDouble(nextToken.ValueData);
                        break;
                    case "selector":
                        ValidateType(nextToken, JsonTokenType.StartObject, typeof(TestDependency), state.Path);

                        state.Path.Push(nextToken.PropertyName);
                        TestFileSelector selector = DeserializeFileSelector(ref state);
                        state.Path.Pop();

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

                nextToken = GetNextToken(ref state);
            }

            return dependency;
        }

        private TestFileSelector DeserializeFileSelector(ref TokenParseState state)
        {
            TestFileSelector selector = new TestFileSelector();

            TokenResult nextToken = GetNextToken(ref state);
            while (nextToken.TokenType != JsonTokenType.EndObject && nextToken.TokenType != JsonTokenType.None)
            {
                if (IsTokenValid(nextToken) == false)
                {
                    nextToken = GetNextToken(ref state);
                }

                switch (nextToken.PropertyName)
                {
                    case "path":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

                        selector.Path = GetString(nextToken.ValueData);
                        break;
                    case "name":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

                        selector.Name = GetString(nextToken.ValueData);
                        break;
                    case "glob":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

                        selector.Glob = GetString(nextToken.ValueData);
                        break;
                    case "regex":
                        ValidateType(nextToken, JsonTokenType.String, typeof(TestDependency), state.Path);

                        selector.Regex = GetString(nextToken.ValueData);
                        break;
                    case "recursive":

                        if (nextToken.TokenType != JsonTokenType.True && nextToken.TokenType != JsonTokenType.False)
                        {
                            ValidateType(nextToken, JsonTokenType.True, typeof(TestDependency), state.Path);
                        }

                        selector.Recursive = BitConverter.ToBoolean(nextToken.ValueData);
                        break;
                }

                nextToken = GetNextToken(ref state);
            }

            return selector;
        }

        private void ValidateType(TokenResult parseResult, JsonTokenType expectedType, Type objectType, Stack<string> path)
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

            string pathStr = GetPath(path);

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

        private TokenResult GetNextToken(ref TokenParseState state)
        {
            if (state.Reader.Read() == false)
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = JsonTokenType.None
                };
            }

            if (state.Reader.TokenType == JsonTokenType.StartObject || state.Reader.TokenType == JsonTokenType.StartArray)
            {
                return new TokenResult()
                {
                    PropertyName = null,
                    TokenType = state.Reader.TokenType
                };
            }
            else if (state.Reader.TokenType == JsonTokenType.PropertyName)
            {
                string propertyName = state.Reader.GetString();
                state.Reader.Read();

                if (_valueTypeTokens.Contains(state.Reader.TokenType))
                {
                    return new TokenResult()
                    {
                        PropertyName = propertyName,
                        TokenType = state.Reader.TokenType,
                        ValueData = state.Reader.ValueSpan
                    };
                }
                else
                {
                    return new TokenResult()
                    {
                        PropertyName = propertyName,
                        TokenType = state.Reader.TokenType,
                        ValueData = state.Reader.ValueSpan
                    };
                }
            }
            else if (_valueTypeTokens.Contains(state.Reader.TokenType))
            {
                return new TokenResult()
                {
                    TokenType = state.Reader.TokenType,
                    ValueData = state.Reader.ValueSpan
                };
            }
            else
            {
                return new TokenResult()
                {
                    TokenType = state.Reader.TokenType,
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

        public ref struct TokenParseState
        {
            public Stack<string> Path { get; init; }

            public Utf8JsonReader Reader { get; init; }
        }
        public class JSONParseException : Exception
        {
            public JSONParsedProperty ParsedResult { get; } = null;

            public JSONParseException(string message)
                : base(message)
            {
            }
        }
    }
}
