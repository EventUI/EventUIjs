/**Copyright (c) 2025 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Root namespace declaration for the EVUIUnit library.
@namespace*/
const EVUIUnit = {};

/**The arguments injected from the server into the JS page that is spawning iframes to run tests.
@type {EVUIUnit.Resources.TestHostServerArgs}*/
EVUIUnit.TestHostServerArgs = {};

/**The arguments injected from the server into the JS page that is running a test.
@type {EVUIUnit.Resources.TestRunnerServerArgs}*/
EVUIUnit.TestRunnerServerArgs = {};

/**Constants table for the EVUIUnit library.
@static*/
EVUIUnit.Constants = {};

/**The query string parameter value for a file name.*/
EVUIUnit.Constants.QS_TestFile = "file";

/**THe query string parameter value used for a test session (not yet implemented).*/
EVUIUnit.Constants.QS_TestSession = "session";

/**The path of the TestRunner implementing page relative to the root of the site.*/
EVUIUnit.Constants.Path_TestRunner = "/Unit/TestRunner";

/**The CSS class used to find and style an output "console" log-like element.*/
EVUIUnit.Constants.Class_TestOutput = "testOutputContainer";

/**The CSS class for formatting LogLevel.Critical messages.*/
EVUIUnit.Constants.Class_TestOutput_Critical = "output-critical";

/**The CSS class for formatting LogLevel.Error messages.*/
EVUIUnit.Constants.Class_TestOutput_Error = "output-error";

/**The CSS class for formatting LogLevel.Warn messages.*/
EVUIUnit.Constants.Class_TestOutput_Warn = "output-warn";

/**The CSS class for formatting LogLevel.Debug messages.*/
EVUIUnit.Constants.Class_TestOutput_Debug = "output-debug";

/**The CSS class for formatting LogLevel.Info, Debug, or Trace messages.*/
EVUIUnit.Constants.Class_TestOutput_Normal = "output-normal";

/**The CSS class for formatting messages with no pre-set log level.*/
EVUIUnit.Constants.Class_TestOutput_Console = "output-console";
