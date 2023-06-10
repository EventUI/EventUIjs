/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Interfaces
{
    /// <summary>
    /// Represents the base interface for all items in the test model.
    /// </summary>
    public interface INamedRunnableItem
    {
        /// <summary>
        /// The ID of the item.
        /// </summary>
        public Guid ID { get; }

        /// <summary>
        /// The name or alias the item can be referred to by.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The type of item that is being represented.
        /// </summary>
        public TestRunnableType ItemType { get; }
    }
}
