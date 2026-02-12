import { Dialog, DialogContent } from "@hoalu/ui/dialog";
import { useState } from "react";

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
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{props.data.map((image) => (
					<div
						key={image.name}
						tabIndex={0}
						className="group bg-muted/50 hover:border-primary/50 relative aspect-square cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-md"
						onClick={() => setSelectedImage(image)}
						onKeyUp={() => setSelectedImage(image)}
					>
						<img
							src={image.presignedUrl}
							alt={image.description ?? ""}
							className="h-full w-full object-cover transition-transform group-hover:scale-105"
						/>
						{image.description && (
							<div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
								<p className="truncate text-xs text-white">{image.description}</p>
							</div>
						)}
					</div>
				))}
			</div>

			<Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
				<DialogContent className="max-w-4xl">
					<div className="relative w-full">
						{selectedImage && (
							<>
								<img
									src={selectedImage.presignedUrl}
									alt={selectedImage.description ?? ""}
									className="w-full rounded-lg"
								/>
								{selectedImage.description && (
									<p className="text-muted-foreground mt-4 text-sm">{selectedImage.description}</p>
								)}
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
