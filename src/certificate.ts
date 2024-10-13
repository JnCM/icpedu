/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Certificate {
    @Property()
    public docType?: string;

    @Property()
    public TxID: string = '';

    @Property()
    public TxTimestamp: string = '';

    @Property()
    public HashString: string = '';
}
