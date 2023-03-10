import { Post } from '@/atoms/postAtom'
import { firestore, storage } from '@/firebase/clientApp'
import useSelectFile from '@/hooks/useSelectFile'
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Box,
	Button,
	Flex,
	Icon,
	Image,
	Input,
	Stack,
	Text,
	Textarea,
} from '@chakra-ui/react'
import { User } from 'firebase/auth'
import {
	addDoc,
	collection,
	doc,
	serverTimestamp,
	Timestamp,
	updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'
import { useRouter } from 'next/router'
import { default as React, useEffect, useRef, useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { BiPoll } from 'react-icons/bi'
import { BsLink45Deg, BsMic } from 'react-icons/bs'
import { IoDocumentText, IoImageOutline } from 'react-icons/io5'
import { useRecoilState, useSetRecoilState } from 'recoil'
import ImageUpload from './PostForm/ImageUpload'
import TextInputs from './PostForm/TextInputs'
import TabItem from './TabItem'

const formTabs: TabList[] = [
	{
		title: 'Post',
		icon: IoDocumentText,
	},
	{
		title: 'Image & Video',
		icon: IoImageOutline,
	},
	{
		title: 'Link',
		icon: BsLink45Deg,
	},
	{
		title: 'Poll',
		icon: BiPoll,
	},
	{
		title: 'Talk',
		icon: BsMic,
	},
]

export type TabList = {
	title: string
	icon: typeof Icon.arguments
}

type NewPostFormProps = {
	user: User
	communityImageURL?: string
}

const NewPostForm: React.FC<NewPostFormProps> = ({
	user,
	communityImageURL,
}) => {
	const router = useRouter()
	const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
	const [textInputs, setTextInputs] = useState({
		title: '',
		body: '',
	})
	const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(false)

	const handleCreatePost = async () => {
		const { communityId } = router.query
		// create new post object => type Post
		const newPost: Post = {
			communityId: communityId as string,
			communityImageURL: communityImageURL || '',
			creatorId: user.uid,
			creatorDisplayName: user.email!.split('@')[0],
			title: textInputs.title,
			body: textInputs.body,
			numberOfComments: 0,
			voteStatus: 0,
			createdAt: serverTimestamp() as Timestamp,
		}

		setLoading(true)
		try {
			// store the post in db
			const postDocRef = await addDoc(collection(firestore, 'posts'), newPost)

			// check for selectedFile
			if (selectedFile) {
				// store in storage => getDownloadURL(return imageURL) want to successfully post before upload
				const imageRef = ref(storage, `post/${postDocRef.id}/image`)
				await uploadString(imageRef, selectedFile, 'data_url')
				const downloadURL = await getDownloadURL(imageRef)

				// update post doc by adding imageURL
				await updateDoc(postDocRef, {
					imageURL: downloadURL,
				})
			}
			// redirect the user back to the communityPage using the router
			router.back()
		} catch (error: any) {
			console.log('handleCreatePost error', error.message)
			setError(true)
		}
		setLoading(false)
	}

	const onTextChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {
			target: { name, value },
		} = event
		setTextInputs((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	return (
		<Flex direction="column" bg="white" borderRadius={4} mt={2}>
			<Flex width="100%">
				{formTabs.map((item) => (
					<TabItem
						key={item.title}
						item={item}
						selected={item.title === selectedTab}
						setSelectedTab={setSelectedTab}
					/>
				))}
			</Flex>
			<Flex p={4}>
				{selectedTab === 'Post' && (
					<TextInputs
						textInputs={textInputs}
						handleCreatePost={handleCreatePost}
						onChange={onTextChange}
						loading={loading}
					/>
				)}
				{selectedTab === 'Image & Video' && (
					<ImageUpload
						selectedFile={selectedFile}
						onSelectImage={onSelectFile}
						setSelectedTab={setSelectedTab}
						setSelectedFile={setSelectedFile}
					/>
				)}
			</Flex>
			{error && (
				<Alert status="error">
					<AlertIcon />
					<Text mr={2}>Error creating post</Text>
				</Alert>
			)}
		</Flex>
	)
}
export default NewPostForm
