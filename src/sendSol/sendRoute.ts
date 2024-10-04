import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
} from '@solana/web3.js';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  actionSpecOpenApiPostRequestBody,
  actionsSpecOpenApiGetResponse,
  actionsSpecOpenApiPostResponse,
} from '../openapi';
import {
  ActionsSpecGetResponse,
  ActionsSpecPostRequestBody,
  ActionsSpecPostResponse,
} from '../../spec/actions-spec';
import { prepareTransaction } from '../transaction-utils';

const DONATION_DESTINATION_WALLET =
  '699ZHhhPbJWNN7dFmGGFpE1rrJQcwYEm4Aqh2eaMh5V8';
const DONATION_AMOUNT_SOL_OPTIONS = [0.1, 0.5, 1];
const DEFAULT_DONATION_AMOUNT_SOL = 1;

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Send SOL'],
    responses: actionsSpecOpenApiGetResponse,
  }),
  (c) => {
    const { icon, title, description } = getDonateInfo();
    const amountParameterName = 'amount';
    const response: ActionsSpecGetResponse = {
      icon,
      label: `${DEFAULT_DONATION_AMOUNT_SOL} SOL`,
      title,
      description,
      links: {
        actions: [
          ...DONATION_AMOUNT_SOL_OPTIONS.map((amount) => ({
            label: `${amount} SOL`,
            href: `/api/send/${amount}`,
          })),
          {
            href: `/api/send/{${amountParameterName}}`,
            label: 'SEND SOL',
            parameters: [
              {
                name: amountParameterName,
                label: 'SOL amount',
              },
            ],
          },
        ],
      },
    };

    return c.json(response, 200);
  },
);

// app.openapi(
//   createRoute({
//     method: 'get',
//     path: '/{amount}',
//     tags: ['Donate'],
//     request: {
//       params: z.object({
//         amount: z.string().openapi({
//           param: {
//             name: 'amount',
//             in: 'path',
//           },
//           type: 'number',
//           example: '1',
//         }),
//       }),
//     },
//     responses: actionsSpecOpenApiGetResponse,
//   }),
//   (c) => {
//     const amount = c.req.param('amount');
//     const { icon, title, description } = getDonateInfo();
//     const response: ActionsSpecGetResponse = {
//       icon,
//       label: `${amount} SOL`,
//       title,
//       description,
//     };
//     return c.json(response, 200);
//   },
// );

// app.openapi(
//   createRoute({
//     method: 'post',
//     path: '/{amount}',
//     tags: ['Donate'],
//     request: {
//       params: z.object({
//         amount: z
//           .string()
//           .optional()
//           .openapi({
//             param: {
//               name: 'amount',
//               in: 'path',
//               required: false,
//             },
//             type: 'number',
//             example: '1',
//           }),
//       }),
//       body: actionSpecOpenApiPostRequestBody,
//     },
//     responses: actionsSpecOpenApiPostResponse,
//   }),
//   async (c) => {
//     const amount =
//       c.req.param('amount') ?? DEFAULT_DONATION_AMOUNT_SOL.toString();
//     const { account } = (await c.req.json()) as ActionsSpecPostRequestBody;

//     const parsedAmount = parseFloat(amount);
//     const transaction = await prepareDonateTransaction(
//       new PublicKey(account),
//       new PublicKey(DONATION_DESTINATION_WALLET),
//       parsedAmount * LAMPORTS_PER_SOL,
//     );
//     const response: ActionsSpecPostResponse = {
//       transaction: Buffer.from(transaction.serialize()).toString('base64'),
//     };
//     return c.json(response, 200);
//   },
// );

function getDonateInfo(): Pick<
  ActionsSpecGetResponse,
  'icon' | 'title' | 'description'
> {
  const icon =
    'https://bafkreiefn3ze7e4kppyziaw4emxr27hw2atagm67d3vovai3qpc2w6svqq.ipfs.web3approved.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaWQiOiJiYWZrcmVpZWZuM3plN2U0a3BweXppYXc0ZW14cjI3aHcyYXRhZ202N2Qzdm92YWkzcXBjMnc2c3ZxcSIsInByb2plY3RfdXVpZCI6IjM3YzUxMTQ3LTVmZDEtNGU1ZS1hNWI2LWE3M2QwYWYzZmI3MiIsImlhdCI6MTcyNzk0MzQzNywic3ViIjoiSVBGUy10b2tlbiJ9.w4wcGmGs3xVRH8yGT3dLoh24618Cg17qLEKnH_GeJgw';
  const title = 'SEND SOL TO THE MOON';
  const description =
    'This is demo of Blink on Solana';
  return { icon, title, description };
}
async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number,
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(recipient),
      lamports: lamports,
    }),
  ];
  return prepareTransaction(instructions, payer);
}

export default app;
