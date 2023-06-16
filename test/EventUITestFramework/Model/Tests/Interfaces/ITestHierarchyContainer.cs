/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/
namespace EventUITestFramework.Model.Tests.Interfaces
{
    public interface ITestHierarchyContainer : INamedRunnableItem
    {
        List<TestDependency> Dependencies { get; set; }
        string Description { get; set; }
        bool Recursive { get; set; }
        List<TestRunnable> Run { get; set; }
        List<TestRunnable> Skip { get; set; }
    }
}