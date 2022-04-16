import { NextApiHandler } from 'next';
import { getSession } from 'next-auth/react';

import { getItemsForUser } from '@/utils/models/item.server';

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  if (!session?.user.id) {
    res.status(401);
    return;
  }
  const items = await getItemsForUser(session?.user.id);
  res.status(200).json({ items });
};

export default handler;
