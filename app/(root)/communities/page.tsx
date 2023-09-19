import { fetchUser, fetchUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import UserCard from '@/components/cards/UserCard';
import { fetchCommunities } from '@/lib/actions/community.actions';
import CommunityCard from '@/components/cards/CommunityCard';

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect('/onboarding');

  // Fetch communities
  const result = await fetchCommunities({
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <section className='head-text mb-10'>
      <h1 className='head-text mb-10'>Communities</h1>

      {/* Search Bar */}

      <div className='flex flex-row flex-wrap gap-9 mb-14'>
        {result.communities.length === 0 ? (
          <p className='no-result'>No community</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default Page;
