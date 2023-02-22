import { authModalState } from '@/atoms/authModalAtom'
import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/react'
import React from 'react'
import { useRecoilState } from 'recoil'

const AuthModal: React.FC = () => {
	const [modalState, setModalState] = useRecoilState(authModalState)

	const handleClose = () => {
		setModalState((prev) => ({
			...prev,
			open: false,
		}))
	}
	return (
		<>
			<Modal isOpen={modalState.open} onClose={handleClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Modal Title</ModalHeader>
					<ModalCloseButton />
					<ModalBody>Here is the Modal Body</ModalBody>
				</ModalContent>
			</Modal>
		</>
	)
}
export default AuthModal
