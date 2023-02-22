import { auth } from '@/firebase/clientApp'
import { Button, Flex, Image, Text } from '@chakra-ui/react'
import React from 'react'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'

const OAuthButtons: React.FC = () => {
	const [sighInWithGoogle, user, loading, error] = useSignInWithGoogle(auth)
	return (
		<Flex direction="column" width="100%" mb={4}>
			<Button
				variant="oauth"
				mb={2}
				isLoading={loading}
				onClick={() => sighInWithGoogle()}
			>
				<Image
					src="/images/googlelogo.png"
					alt="google logo"
					height="20px"
					mr={4}
				/>
				Continue with Google
			</Button>
			<Button variant="oauth">Some Other Provider</Button>
			{error && <Text>{error.message}</Text>}
		</Flex>
	)
}
export default OAuthButtons
