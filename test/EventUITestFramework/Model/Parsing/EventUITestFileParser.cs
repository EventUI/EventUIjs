/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.Model.Parsing.Contexts;
using EventUITestFramework.Scanning;
using System.Collections.Immutable;
using System.ComponentModel;

namespace EventUITestFramework.Model.Parsing
{
    public static class EventUITestFileParser
    {
        public static TokenContextInstance GetFileTokens(string fileContents)
        {
            var parser = new TokenParser();
            return parser.Parse<EventUITestFileContext>(fileContents);
        }

        public static TestFileParseResult ParseTestFile(FileReadResult fileReadResult)
        {
            if (fileReadResult == null) throw new ArgumentNullException(nameof(fileReadResult));

            return ParseTestFile(fileReadResult.JavaScriptParseResult, fileReadResult.FileInfo?.FullName);
        }

        public static TestFileParseResult ParseTestFile(TokenContextInstance tokenContext, string fullPath)
        {
            if (tokenContext == null) throw new ArgumentNullException(nameof(tokenContext));
            if (tokenContext?.ContextDefinition is EventUITestFileContext fileContext == false) throw new InvalidEnumArgumentException(nameof(tokenContext) + " must be a " + nameof(EventUITestFileContext));
            
            if (ValidateIsPlainText(tokenContext))
            {
                if (tokenContext.Contents.Length == 0) return null; //empty file
                string fileName = Guid.NewGuid().ToString();

                var result = new TestFileParseResult()
                { 
                    FullPath = fullPath,
                    TestFile = new TestFile()
                    {
                        Name = fileName,
                    },
                    Tests = new List<TestCode>()
                    {
                        new TestCode()
                        {
                            Name = fileName + ":1",
                            Code = tokenContext.GetText()
                        }
                    }.ToImmutableList()
                };
                
                return result;
            }


            bool passedFileName = false;
            string testFileName = Guid.NewGuid().ToString();
            TestFile file = new TestFile()
            {
                Name = testFileName,
            };

            TestFileDirective fileDirective = new TestFileDirective();
            List<TestCode> tests = new List<TestCode>();

            TestStartDirective codeStart = null;

            var reader = tokenContext.GetReader();
            TokenContextInstance instance = reader.GetNextContext<EventUITestDirectiveContext>();
            while (instance != null)
            {
                EventUITestDirective directive = EventUITestDirective.GetDirective(instance);

                if (directive is TestFileDirective fileDir && passedFileName == false)
                {
                    if (String.IsNullOrWhiteSpace(fileDir.FileName) == false) testFileName = fileDir.FileName;
                    file.Name = testFileName;
                }
                else if (directive is TestDependencyDirective dependencyDir)
                {
                    TestDependency dependency = new TestDependency()
                    {
                        Name = dependencyDir.DependencyName,
                        Priority = dependencyDir.Priority,
                        DependencyMode = dependencyDir.Mode
                    };

                    if (codeStart == null)
                    {
                        file.Dependencies.Add(dependency);
                    }
                }
                else if (directive is TestStartDirective testStart)
                {
                    if (codeStart != null)
                    {
                        TestCode test = new TestCode()
                        {
                            Name = (String.IsNullOrWhiteSpace(testStart.TestName) == true ? testFileName + "-<anonymous #" + (tests.Count + 1).ToString() + ">" : codeStart.TestName),
                            Code = TokenContextInstance.GetText(codeStart.DirectiveContext.StartToken, instance.StartToken)
                        };

                        tests.Add(test);
                        codeStart = null;
                    }
                    else
                    {
                        codeStart = testStart;
                    }
                }

                passedFileName = true;

                var lastInstance = instance;
                instance = reader.GetNextContext<EventUITestDirectiveContext>(true);

                if (instance == null)
                {
                    if (codeStart == null)
                    {
                        TestCode test = new TestCode()
                        {
                            Name = testFileName + "-<anonymous #" + (tests.Count + 1).ToString() + ">",
                            Code = TokenContextInstance.GetText(lastInstance.StartToken)
                        };

                        tests.Add(test);
                    }
                    else
                    {
                        TestCode test = new TestCode()
                        {
                            Name = (String.IsNullOrWhiteSpace(codeStart.TestName) == true ? testFileName + "-<anonymous #" + (tests.Count + 1).ToString() + ">" : codeStart.TestName),
                            Code = TokenContextInstance.GetText(codeStart.DirectiveContext.StartToken)
                        };

                        tests.Add(test);
                    }
                }
            }

            return new TestFileParseResult()
            { 
                FullPath = fullPath,
                TestFile = file,
                Tests = tests.ToImmutableList()
            };
        }

        private static bool ValidateIsPlainText(TokenContextInstance tokenContext)
        {
            return tokenContext.GetReader().GetNextContext<EventUITestDirectiveContext>() == null;
        }

        private static void ReadTokens(TestFileParseState state, TokenContextInstance instance)
        {
            TokenReader reader = instance.GetReader();
            TokenContextInstance nextDirective = reader.GetNextContext<EventUITestDirectiveContext>();
        }

        private class TestFileParseState
        {
            public string FullPath { get; set; } = null;

            public TokenContextInstance TokenContext { get; set; } = null;

            public TestFile TestFile { get; set; } = null;

            public List<TestCode> Tests { get; set; } = new List<TestCode>();

            public Exception Exception { get; set; } = null;
        } 
    }
}
