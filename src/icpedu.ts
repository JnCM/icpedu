
/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Certificate} from './certificate';

@Info({title: 'ICPEdu', description: 'Smart contract for registry digital certificates'})
export class ICPEduContract extends Contract {

    // CreateCertificate issues a new certificate to the world state with given details.
    @Transaction()
    public async CreateCertificate(ctx: Context, serialNumber: string, createdAt: string, expiresAt: string): Promise<void> {
        const exists = await this.CertificateExists(ctx, serialNumber);
        if (exists) {
            throw new Error(`The certificate ${serialNumber} already exists`);
        }

        const certificate = {
            SerialNumber: serialNumber,
            CreatedAt: createdAt,
            ExpiresAt: expiresAt,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(serialNumber, Buffer.from(stringify(sortKeysRecursive(certificate))));
    }

    // ReadCertificate returns the certificate stored in the world state with given SerialNumber.
    @Transaction(false)
    public async ReadCertificate(ctx: Context, serialNumber: string): Promise<string> {
        const certificateJSON = await ctx.stub.getState(serialNumber); // get the certificate from chaincode state
        if (certificateJSON.length === 0) {
            throw new Error(`The certificate ${serialNumber} does not exist`);
        }
        return certificateJSON.toString();
    }

    // CertificateExists returns true when certificate with given SerialNumber exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async CertificateExists(ctx: Context, serialNumber: string): Promise<boolean> {
        const certificateJSON = await ctx.stub.getState(serialNumber);
        return certificateJSON.length > 0;
    }

    // GetAllCertificates returns all certificates found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllCertificates(ctx: Context): Promise<string> {
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
