
/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
// import stringify from 'json-stringify-deterministic';
// import sortKeysRecursive from 'sort-keys-recursive';
import {Certificate} from './certificate';

@Info({title: 'ICPEdu', description: 'Smart contract for saving digital certificates'})
export class ICPEduContract extends Contract {

    // SaveHash issues a new certificate to the world state with given details.
    @Transaction()
    public async SaveHash(ctx: Context, hashString: string): Promise<void> {
        const exists = await this.HashExists(ctx, hashString);
        if (exists) {
            throw new Error(`The certificate ${hashString} already exists`);
        }

        const certificate = {
            TxID: ctx.stub.getTxID(),
            TxTimestamp: ctx.stub.getTxTimestamp(),
            HashString: hashString
        };
        const certificateBuffer = Buffer.from(JSON.stringify(certificate));
        
        ctx.stub.setEvent('SaveHash', certificateBuffer);
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(hashString, certificateBuffer);
    }

    // GetHash returns the certificate stored in the world state with given HashString.
    @Transaction(false)
    public async GetHash(ctx: Context, hashString: string): Promise<string> {
        const certificateJSON = await ctx.stub.getState(hashString); // get the certificate from chaincode state
        if (certificateJSON.length === 0) {
            throw new Error(`The certificate ${hashString} does not exist`);
        }
        return certificateJSON.toString();
    }

    // HashExists returns true when certificate with given HashString exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async HashExists(ctx: Context, hashString: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(hashString);
        return certificateJSON.length > 0;
    }

    // GetAllHashes returns all certificates found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllHashes(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all certificates in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as Certificate;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
