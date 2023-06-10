/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel.Deserialization;

namespace EventUITestFramework.TestModel
{
    /// <summary>
    /// Represents a dependency that has been resolved.
    /// </summary>
    public class ResolvedTestDependency
    {
        /// <summary>
        /// The ID of the dependency that has been resolved.
        /// </summary>
        public Guid DependencyID { get; } = Guid.NewGuid();

        /// <summary>
        /// The deserialized object from a JavaScript or JSON file.
        /// </summary>
        public TestDependency SourceDependency { get; } = null;

        /// <summary>
        /// The full path of the dependency file on disk.
        /// </summary>
        public string FullPath { get; } = null;
    }
}
