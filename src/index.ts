/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {type Contract} from 'fabric-contract-api';
import {ICPEduContract} from './icpedu';

export const contracts: typeof Contract[] = [ICPEduContract];