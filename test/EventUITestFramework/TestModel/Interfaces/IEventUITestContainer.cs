using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Interfaces
{
    public interface IEventUITestContainer : IEventUITestChild
    {
        List<IEventUITestChild> Children { get; set; }  
    }
}
