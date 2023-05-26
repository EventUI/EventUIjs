using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class TestDependency : INamedTestItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestFileSelector Selector { get; set; } = null;

        public bool Exclude { get; set; } = false;

        public double Priority { get; set; } = 0;

        public TestRunnableType ItemType { get; } = TestRunnableType.Dependency;
    }
}
