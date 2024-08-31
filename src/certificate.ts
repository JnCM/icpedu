/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Certificate {
    @Property()
    public docType?: string;

    @Property()
    public SerialNumber: string = '';

    @Property()
    public CreatedAt: string = '';

    @Property()
    public ExpiresAt: string = '';
}
