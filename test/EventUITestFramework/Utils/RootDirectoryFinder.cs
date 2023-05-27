using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Utils
{
    public static class RootDirectoryFinder
    {
        public static DirectoryInfo GetRootRepositoryDirectory(IEnumerable<string> rootFolderFileSystemItems, bool ignoreCase)
        {
            DirectoryInfo executingDirectory = new DirectoryInfo(Directory.GetCurrentDirectory());
            if (executingDirectory == null || executingDirectory.Exists == false)
            {
                throw new DirectoryNotFoundException("Cannot resolve root directory.");
            }

            HashSet<string> items = new HashSet<string>();
            foreach (string item in rootFolderFileSystemItems)
            {
                if (ignoreCase == true)
                {
                    items.Add(item.ToLower());
                }
                else
                {
                    items.Add(item);
                }
            }

            int numItemsToFind = items.Count;

            var parent = executingDirectory;
            while (parent != null)
            {
                int foundItems = 0;

                foreach (var fiItem in parent.EnumerateFileSystemInfos())
                {                    
                    string name = (ignoreCase == true) ? fiItem.Name.ToLower(): fiItem.Name;
                    if (items.Contains(name))
                    {
                        foundItems++;
                    }

                    if (foundItems == numItemsToFind)
                    {
                        return parent;
                    }
                }

                parent = parent.Parent;
            }

            throw new DirectoryNotFoundException("Could not find root directory for repository starting from " + executingDirectory.FullName);
        }
    }
}
