using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Interfaces
{
    public interface IEventUITestChild : IEventUITestItem
    {
        List<EventUITestDependency> Dependencies { get; }

        IEventUITestContainer Parent { get; }
    }
}
