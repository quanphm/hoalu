import { useState } from "react";

import { Dialog, DialogContent } from "@hoalu/ui/dialog";

export function ImageGallery(props: {
	data: { name: string; description: string | null; presignedUrl: string }[];
}) {
	const [selectedImage, setSelectedImage] = useState<{
		name: string;
		description: string | null;
		presignedUrl: string;
	} | null>(null);

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
				{props.data.map((image) => (
					<div
						key={image.name}
						className="relative aspect-square cursor-pointer overflow-hidden"
						onClick={() => setSelectedImage(image)}
						onKeyUp={() => setSelectedImage(image)}
					>
						<img
							src={image.presignedUrl}
							alt={image.description ?? ""}
							className="h-full object-cover"
						/>
					</div>
				))}
			</div>

			<Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
				<DialogContent className="max-w-3xl">
					<div className="relative mt-2 w-full">
						{selectedImage && (
							<img src={selectedImage.presignedUrl} alt={selectedImage.description ?? ""} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
