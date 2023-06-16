/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// Represents a segment of code from a TestFile to execute as its own test in isolation.
    /// </summary>
    public class TestCode : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.TestCode;

        public string Code { get; set; } = null;
    }
}
