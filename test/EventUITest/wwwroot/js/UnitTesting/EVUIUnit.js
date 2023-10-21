/**Copyright (c) 2023 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

const EVUIUnit = {};

/**The arguments injected from the server into the JS page that is spawning iframes to run tests.
@type {EVUIUnit.Resources.TestHostServerArgs}*/
EVUIUnit.TestHostServerArgs = {};

/**The arguments injected from the server into the JS page that is running a test.
@type {EVUIUnit.Resources.TestRunnerServerArgs}*/
EVUIUnit.TestRunnerServerArgs = {};

EVUIUnit.Constants = {};
EVUIUnit.Constants.QS_TestFile = "file";
EVUIUnit.Constants.QS_TestSession = "session";
EVUIUnit.Constants.Path_TestRunner = "/Unit/TestRunner";
EVUIUnit.Constants.Class_TestOutput = "testOutputContainer";
EVUIUnit.Constants.Class_TestOutput_Error = "output-error";
EVUIUnit.Constants.Class_TestOutput_Critical = "output-critical";
EVUIUnit.Constants.Class_TestOutput_Normal = "output-normal";
EVUIUnit.Constants.Class_TestOutput_Console = "output-console";
