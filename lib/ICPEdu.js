const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class ICPEdu extends Contract{

    async certificateExists(ctx, id){
        const certificateJSON = await ctx.stub.getState(id);
        return certificateJSON && certificateJSON.length > 0;
    }

    async registerCertificate(ctx, id, serialNumber, createdAt, expiresAt){
        const exists = await this.certificateExists(ctx, id);
        if(exists){
            throw new Error(`Certificate #${id} already exists!`);
        }

        const certificate = {
            SerialNumber: serialNumber,
            CreatedAt: createdAt,
            ExpiresAt: expiresAt,
            UpdatedAt: createdAt
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(certificate))));
        return JSON.stringify(certificate);
    }

    async getCertificate(ctx, id){
        const certificateJSON = await ctx.stub.getState(id);
        if(!certificateJSON || certificateJSON.length == 0){
            throw new Error(`Certificate #${id} does not exist!`);
        }

        return certificateJSON.toString();
    }

    async renewCertificate(ctx, id, serialNumber, createdAt, expiresAt, updatedAt){
        const certificateJSON = await ctx.stub.getState(id);
        if(!certificateJSON || certificateJSON.length == 0){
            throw new Error(`Certificate #${id} does not exist!`);
        }

        const updatedCertificate = {
            SerialNumber: serialNumber,
            CreatedAt: createdAt,
            ExpiresAt: expiresAt,
            UpdatedAt: updatedAt
        }

        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedCertificate))));
    }

    async getAllCertificates(ctx){
        const allCertificates = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while(!result.done){
            const strValue = Buffer.from(result.value.value.toString()).toString('utf-8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allCertificates.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allCertificates);
    }
}

module.exports = ICPEdu;