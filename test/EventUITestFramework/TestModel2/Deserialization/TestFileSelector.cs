using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class TestFileSelector
    {
        public string Path { get; set; } = null;

        public string Glob { get; set; } = null;

        public string Regex { get; set; } = null;

        public string Alias { get; set; } = null;

        public bool Recursive { get; set; } = true;
    }
}
