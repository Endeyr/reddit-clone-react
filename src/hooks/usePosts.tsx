import { Post, postState } from '@/atoms/postAtom'
import { firestore, storage } from '@/firebase/clientApp'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import React from 'react'
import { useRecoilState } from 'recoil'

const usePosts = () => {
	const [postStateValue, setPostStateValue] = useRecoilState(postState)

	const onVote = async () => {}

	const onSelectPost = () => {}

	const onDeletePost = async (post: Post): Promise<boolean> => {
		console.log('DELETING POST: ', post.id)
		try {
			// check if image, delete if exist from firebase
			if (post.imageURL) {
				const imageRef = ref(storage, `post/${post.id}/image`)
				await deleteObject(imageRef)
			}
			// delete post doc from firestore
			const postDocRef = doc(firestore, 'posts', post.id!)
			await deleteDoc(postDocRef)
			// update recoil state
			setPostStateValue((prev) => ({
				...prev,
				posts: prev.posts.filter((item) => item.id !== post.id),
			}))
			return true
		} catch (error) {
			console.log('THERE WAS AN ERROR', error)
			return false
		}
	}

	return {
		postStateValue,
		setPostStateValue,
		onVote,
		onDeletePost,
		onSelectPost,
	}
}
export default usePosts
