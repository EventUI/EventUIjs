using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Interfaces
{
    public interface INamedTestItem
    {
        public Guid ID { get; }

        public string Name { get; set; }

        public TestRunnableType ItemType { get; }
    }
}
