using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Utils
{
    public static class RootDirectoryFinder
    {
        public static DirectoryInfo GetRootRepositoryDirectory()
        {
            DirectoryInfo executingDirectory = new DirectoryInfo(Directory.GetCurrentDirectory());
            if (executingDirectory == null || executingDirectory.Exists == false)
            {
                throw new DirectoryNotFoundException("Cannot resolve root directory.");
            }            

            var parent = executingDirectory;
            while (parent != null)
            {
                bool hasTest = false;
                bool hasBuild = false;
                bool hasSrc = false;

                var dirs = parent.GetDirectories();
                foreach (var dir in dirs)
                {
                    string lowerName = dir.Name.ToLower();
                    if (lowerName == "test")
                    {
                        hasTest = true;
                    }
                    else if (lowerName == "src")
                    {
                        hasSrc = true;
                    }
                    else if (lowerName == "build")
                    {
                        hasBuild = true;
                    }

                    if (hasTest == true && hasSrc == true && hasBuild == true)
                    {
                        dir.GetFiles().Any(f => f.Name.ToLower() == "license") == true)
                        {
                            return parent;
                        }
                    }                    
                }

                parent = parent.Parent;
            }

            throw new DirectoryNotFoundException("Could not find root directory for repository starting from " + executingDirectory.FullName);
        }
    }
}
