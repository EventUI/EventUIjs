using System.Text.RegularExpressions;

namespace EventUIBuildFramework
{
    public static class EVUICompile
    {
        public static string ConcatenateSource(string inputDirectory)
        {
            if (Directory.Exists(inputDirectory) == false) throw new DirectoryNotFoundException($"Directory {inputDirectory} does not exist.");

            var allJSFiles = Directory.GetFiles(inputDirectory, "*.js", SearchOption.AllDirectories);
            var isEvuiRegex = new Regex("\\\\eventui.js$", RegexOptions.IgnoreCase);

            var evuiJSFilePath = allJSFiles.FirstOrDefault(isEvuiRegex.IsMatch);
            if (evuiJSFilePath == null)
            {
                throw new Exception("Could not find initial EVUI.js file.");
            }

            using (var stringWriter = new StringWriter())
            {
                stringWriter.WriteLine(File.ReadAllText(evuiJSFilePath)); 

                foreach (var file in allJSFiles)
                {
                    if (isEvuiRegex.IsMatch(file) == true) continue;

                    FileInfo fi = new FileInfo(file);
                    stringWriter.WriteLine($"\n\n/********************************************************{fi.Name}********************************************************/");
                    stringWriter.WriteLine(File.ReadAllText(file));                    
                }

                return stringWriter.ToString();
            }
        }

        public static string MinifySource(string source)
        {
            if (string.IsNullOrWhiteSpace(source)) throw new ArgumentNullException("source");

            var minificationResult = NUglify.Uglify.Js(source);
            if (minificationResult.HasErrors)
            {
                throw new Exception(minificationResult.Errors[0].ToString());
            }

            return """
                /**Copyright (c) 2023 Richard H Stannard
                
                This source code is licensed under the MIT license found in the
                LICENSE file in the root directory of this source tree.*/

                """ + minificationResult.Code;
        }

        public static void WriteFile(string outputDirectory, string code, string extension)
        {
            if (string.IsNullOrWhiteSpace(outputDirectory)) throw new ArgumentNullException("outputDirectory");
            if (string.IsNullOrWhiteSpace(code)) throw new ArgumentNullException("code");

            var di = new DirectoryInfo(outputDirectory);
            if (di.Exists == false)
            {
                di.Create();
            }

            File.WriteAllText(Path.Combine(outputDirectory, "evui." + extension), code);  
        }
    }
}