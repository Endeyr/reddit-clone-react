import { Community, communityState } from '@/atoms/communitiesAtom'
import About from '@/components/Community/About'
import CommunityNotFound from '@/components/Community/CommunityNotFound'
import CreatePostLink from '@/components/Community/CreatePostLink'
import Header from '@/components/Community/Header'
import PageContent from '@/components/Layout/PageContent'
import Posts from '@/components/Posts/Posts'
import { firestore } from '@/firebase/clientApp'
import { doc, getDoc } from 'firebase/firestore'
import { GetServerSidePropsContext } from 'next'
import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import safeJsonStringify from 'safe-json-stringify'

type CommunityPageProps = {
	communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
	const setCommunityStateValue = useSetRecoilState(communityState)

	useEffect(() => {
		setCommunityStateValue((prev) => ({
			...prev,
			currentCommunity: communityData,
		}))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [communityData])

	// Community was not found in the database
	if (!communityData) {
		return <CommunityNotFound />
	}
	return (
		<>
			<Header communityData={communityData} />
			{/* @ts-ignore */}
			<PageContent>
				<>
					<CreatePostLink />
					<Posts communityData={communityData} />
				</>
				<>
					<About communityData={communityData} />
				</>
			</PageContent>
		</>
	)
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
	//get community data and pass it to client
	try {
		const communityDocRef = doc(
			firestore,
			'communities',
			context.query.communityId as string
		)
		const communityDoc = await getDoc(communityDocRef)

		return {
			props: {
				communityData: communityDoc.exists()
					? JSON.parse(
							safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
					  )
					: '',
			},
		}
	} catch (error) {
		// Could add error page here
		console.log('getServerSideProps error', error)
		return {
			redirect: {
				destination: '/',
				statusCode: 307,
			},
		}
	}
}

export default CommunityPage
