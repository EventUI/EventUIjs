using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2
{
    public interface ITestRunnableItem
    {
        public string Name { get; set; }

        public TestRunnableType Type { get; }

        public string Path { get; set; }
    }
}
