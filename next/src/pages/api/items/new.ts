import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';

import { createItem } from '@/utils/models/item.server';

const handler: NextApiHandler = async (req, res) => {
  console.log(req.body);
  const session = await getSession({ req });
  if (!session?.user.id) {
    res.status(401);
    return;
  }
  await createItem(session?.user.id, req.body.text);
  res.redirect('/home');
};

export default handler;
