using EventUIBuildFramework;

namespace EventUIBuild
{
    public class Program
    {
        static void Main(string[] args)
        {
            string inputDir = null;
            string outputDir = null;
            string mode = null;

            for (int x = 0; x < args.Length; x++)
            {
                if (x == 0)
                {
                    inputDir = args[x];
                }
                else if (x == 1)
                {
                    outputDir = args[x];
                }
                else if (x == 2)
                {
                    mode = args[x];
                }
                else
                {
                    break;
                }
            }

            if (string.IsNullOrEmpty(inputDir))
            {
                throw new ArgumentNullException("Missing input directory path.");
            }
            else if (Directory.Exists(inputDir) == false)
            {
                throw new DirectoryNotFoundException($"Input directory {inputDir} does not exist.");
            }

            if (string.IsNullOrEmpty(outputDir))
            {
                throw new ArgumentNullException("Missing input directory path.");
            }
            else if (outputDir.ToLower() == inputDir.ToLower())
            {
                throw new Exception("The input directory cannot be the same as the output directory.");
            }

            string code = EVUICompile.ConcatenateSource(inputDir);

            if (string.IsNullOrEmpty(mode) == false)
            {
                if (mode.ToLower() == "concat")
                {
                    EVUICompile.WriteFile(outputDir, code, "js");
                    return;
                }
            }

            code = EVUICompile.MinifySource(code);
            EVUICompile.WriteFile(outputDir, code, "min.js");
        }
    }
}