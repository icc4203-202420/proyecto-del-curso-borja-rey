require 'open-uri'
require 'tempfile'
require 'fileutils'

class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy, :event_pictures, :create_video, :video_exists]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    @events = Event.includes(:bar).all
    render json: {
      events: @events.map { |event|
        event.as_json.merge({
          bar_name: event.bar.name
        })
      }
    }, status: :ok
  end

  # GET /events/:id
  def show
    if @event.flyer.attached?
      render json: @event.as_json.merge({
        image_url: url_for(@event.flyer),
        thumbnail_url: url_for(@event.flyer.variant(resize: "100x100")),
        bar_name: @event.bar.name
      }), status: :ok
    else
      render json: @event.as_json.merge({
        bar_name: @event.bar.name
      }), status: :ok
    end
  end

  def create
    @event = Event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'Event created successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @event.destroy
      render json: { message: 'Event successfully deleted.' }, status: :no_content
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def attendances
    @event = Event.find(params[:id])
    @attendances = @event.attendances.includes(:user)

    render json: {
      attendances: @attendances.map { |attendance|
        attendance.as_json.merge({
          user: {
            id: attendance.user.id,
            name: attendance.user.handle,
            first_name: attendance.user.first_name,
            last_name: attendance.user.last_name
          }
        })
      }
    }, status: :ok
  end

  def event_pictures
    @event_pictures = @event.event_pictures
    render json: {
      pictures: @event_pictures.map { |picture|
        picture.as_json.merge(picture_id: picture.id, picture_url: url_for(picture.picture))
      }
    }, status: :ok
  end

  def create_video
    @event_pictures = EventPicture.where(event_id: params[:id])
    if @event_pictures.empty?
      render json: { video_created: false, message: 'No pictures found for this event.' }
      return
    end
  
    puts "-------!!!!----!!!!---!!!---Creating video..."
    Dir.mktmpdir do |dir|
      video_path = create_video_from_active_storage_images(@event_pictures, dir)
      if video_path && File.exist?(video_path)
        render json: { video_created: true, message: 'Video creation successful.' }, status: :ok
      else
        render json: { video_created: false, message: 'Video creation failed.' }
      end
    end
  end

  def video_exists
    if @event.video.attached?
      video_url = url_for(@event.video)  # Genera la URL de Active Storage para el video
      render json: { video_exists: true, video_url: video_url, message: "Video found" }, status: :ok
    else
      render json: { video_exists: false, message: "Video not found" }, status: :ok
    end
  end
  
  private

  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'Event not found' }, status: :not_found unless @event
  end

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date, :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.flyer.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
  end

  def create_video_from_active_storage_images(event_pictures, dir)
    image_files = []
  
    event_pictures.each_with_index do |picture, index|
      begin
        file_path = File.join(dir, "image#{format('%03d', index)}.jpg")
        File.open(file_path, 'wb') { |file| file.write(picture.picture.download) }
        image_files << file_path
        puts "Image saved to temporary path: #{file_path}"
      rescue => e
        puts "Error accessing image for EventPicture ID #{picture.id}: #{e.message}"
      end
    end
  
    # Genera el video en un archivo temporal
    video_tempfile = Tempfile.new(["event_video_#{params[:id]}", '.mp4'], binmode: true)
    video_path = video_tempfile.path
    puts "Video path set to: #{video_path}"
  
    if image_files.any?
      puts "Starting ffmpeg command..."
      system("ffmpeg -framerate 1/3 -i '#{dir}/image%03d.jpg' -c:v libx264 -pix_fmt yuv420p #{video_path}")
  
      if File.exist?(video_path)
        puts "Video successfully created at: #{video_path}"
  
        # Guarda el video en Active Storage adjuntándolo al evento
        @event.video.attach(io: File.open(video_path), filename: "event_#{params[:id]}.mp4", content_type: 'video/mp4')
        puts "Video attached to event with ID #{params[:id]} in Active Storage."
  
        # Limpia los archivos temporales de imágenes y el video
        image_files.each { |path| File.delete(path) if File.exist?(path) }
        video_tempfile.close
        video_tempfile.unlink
      else
        puts "Failed to create video file."
      end
    else
      puts "No images available to create video"
      return nil
    end
  end

  def decode_image(base64_image)
    decoded_data = Base64.decode64(base64_image)
    io = StringIO.new(decoded_data)
    { io: io, filename: "upload.jpg", content_type: "image/jpeg" }
  end
end
