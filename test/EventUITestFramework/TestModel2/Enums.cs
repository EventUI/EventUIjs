using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2
{
    public enum TestRunnableType
    {
        None = 0,
        Dependency = 1,
        Set = 2,
        File = 3,
        TestCode = 4,
        Root = 5
    }

    public enum FileSelectorType
    {
        None = 0,
        Alias = 1,
        RegularExpression = 2,
        Glob = 3,
        Path = 4
    }

    public enum TestFailureMode
    {
        Continue = 0,
        Abandon = 1,
        Terminate = 2
    }
}
