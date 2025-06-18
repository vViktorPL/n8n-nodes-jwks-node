import {
	NodeApiError,
	IExecuteFunctions,
	IDataObject,
	NodeConnectionType
} from 'n8n-workflow';
import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { jwtVerify, createRemoteJWKSet } from 'jose';

export class JwksVerifyNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'JWKS Verify Node',
		name: 'jwksVerifyNode',
		icon: { light: 'file:jwks.png', dark: 'file:jwks.png' },
		group: ['transform'],
		version: 1,
		description: 'Verify JWT with remote JWKS (e.g., Cognito)',
		defaults: {
			name: 'JWKS Verify',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'JWT',
				name: 'jwt',
				type: 'string',
				default: '',
			},
			{
				displayName: 'JWKS URL',
				name: 'jwksUrl',
				type: 'string',
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const token = this.getNodeParameter('jwt', i) as string;
			const jwksUrl = this.getNodeParameter('jwksUrl', i) as string;
			const JWKS = createRemoteJWKSet(new URL(jwksUrl));

			try {
				const { payload } = await jwtVerify(token, JWKS);
				returnData.push({ json: payload as IDataObject });
			} catch (err) {
				throw new NodeApiError(this.getNode(), err);
			}
		}

		return [returnData];
	}
}
