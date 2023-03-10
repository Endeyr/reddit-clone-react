import { communityState } from '@/atoms/communitiesAtom'
import { Post, PostVote } from '@/atoms/postAtom'
import CreatePostLink from '@/components/Community/CreatePostLink'
import PageContent from '@/components/Layout/PageContent'
import PostItem from '@/components/Posts/PostItem'
import PostLoader from '@/components/Posts/PostLoader'
import { auth, firestore } from '@/firebase/clientApp'
import usePosts from '@/hooks/usePosts'
import { Stack } from '@chakra-ui/react'
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from 'firebase/firestore'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import useCommunityData from '../hooks/useCommunityData'

const Home: NextPage = () => {
	const [user, loadingUser] = useAuthState(auth)
	const [loading, setLoading] = useState(false)
	const { communityStateValue } = useCommunityData()
	const {
		postStateValue,
		setPostStateValue,
		onSelectPost,
		onDeletePost,
		onVote,
	} = usePosts()

	const buildUserHomeFeed = async () => {
		setLoading(true)
		try {
			// fetch some posts from the users' communities
			if (communityStateValue.mySnippets.length) {
				const myCommunityIds = communityStateValue.mySnippets.map(
					(snippet) => snippet.communityId
				)
				const postQuery = query(
					collection(firestore, 'posts'),
					where('communityId', 'in', myCommunityIds),
					limit(10)
				)
				const postDocs = await getDocs(postQuery)
				const posts = postDocs.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}))
				setPostStateValue((prev) => ({
					...prev,
					posts: posts as Post[],
				}))
			} else {
				buildNoUserHomeFeed()
			}
		} catch (error) {
			console.log('buildUserHomeFeed error', error)
		}
		setLoading(false)
	}

	const buildNoUserHomeFeed = async () => {
		// fetch post from communities on the site, could add pagination
		setLoading(true)
		try {
			const postQuery = query(
				collection(firestore, 'posts'),
				orderBy('voteStatus', 'desc'),
				limit(10)
			)

			const postDocs = await getDocs(postQuery)
			const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			setPostStateValue((prev) => ({
				...prev,
				posts: posts as Post[],
			}))
		} catch (error) {
			console.log('buildNoUserHomeFeed error', error)
		}
		setLoading(false)
	}

	const getUserPostVotes = async () => {
		try {
			const postIds = postStateValue.posts.map((post) => post.id)
			const postVotesQuery = query(
				collection(firestore, `users/${user?.uid}/postVotes`),
				where('postId', 'in', postIds)
			)
			const postVoteDocs = await getDocs(postVotesQuery)
			const postVotes = postVoteDocs.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}))

			setPostStateValue((prev) => ({
				...prev,
				postVotes: postVotes as PostVote[],
			}))
		} catch (error) {
			console.log('getUserPostVotes error', error)
		}
	}

	// useEffects to manage logic and dataflow
	useEffect(() => {
		if (communityStateValue.snippetsFetched) buildUserHomeFeed()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [communityStateValue.snippetsFetched])

	useEffect(() => {
		if (!user && !loadingUser) buildNoUserHomeFeed()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, loadingUser])

	useEffect(() => {
		if (user && postStateValue.posts.length) getUserPostVotes()

		// cleanup function
		return () => {
			setPostStateValue((prev) => ({
				...prev,
				postVotes: [],
			}))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, postStateValue.posts])

	return (
		<PageContent>
			<>
				<CreatePostLink />
				{loading ? (
					<PostLoader />
				) : (
					<Stack>
						{postStateValue.posts.map((post) => (
							<PostItem
								key={post.id}
								post={post}
								onSelectPost={onSelectPost}
								onDeletePost={onDeletePost}
								onVote={onVote}
								userVoteValue={
									postStateValue.postVotes.find(
										(item) => item.postId === post.id
									)?.voteValue
								}
								userIsCreator={user?.uid === post.creatorId}
								homePage
							/>
						))}
					</Stack>
				)}
			</>
			<>{/* Recommendations */}</>
		</PageContent>
	)
}

export default Home
