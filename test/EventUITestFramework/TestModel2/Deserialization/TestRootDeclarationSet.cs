using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class TestRootDeclarationSet
    {
        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();
    }
}
