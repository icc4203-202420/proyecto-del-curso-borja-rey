# en spec/requests/authentication_spec.rb
# https://sdrmike.medium.com/rails-7-api-only-app-with-devise-and-jwt-for-authentication-1397211fb97c
require 'rails_helper'

RSpec.describe 'API::V1::Beers', type: :request do
  let(:user) { create(:user) }

  before(:each) do
    @token = user.generate_jwt
  end

  after(:each) do
    user.update(jti: SecureRandom.uuid)
  end

  describe 'GET /api/v1/beers' do
    before do
      create_list(:beer, 10)
      get api_v1_beers_path
    end

    it 'returns all beers' do
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['beers'].size).to eq(10)
    end
  end

  describe 'GET /api/v1/beers/:id' do
    let(:beer) { create(:beer) }

    before { get api_v1_beer_path(beer) }

    it 'returns a beer' do
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['beer']['id']).to eq(beer.id)
    end
  end

  describe 'POST /api/v1/beers' do
    let!(:brand) { create(:brand) }
    let(:valid_attributes) {
      {
        name: 'New Beer',
        beer_type: 'Ale',
        style: 'Stout',
        hop: 'Cascade',
        yeast: 'Ale yeast',
        malts: 'Barley',
        ibu: '50',
        alcohol: '6%',
        blg: '12',
        brand_id: brand.id
      }
    }

    context 'when the request is valid' do
      before { post api_v1_beers_path,
        params: { beer: valid_attributes },
        headers: { 'Authorization' => "Bearer #{@token}" } }

      it 'creates a beer' do
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['beer']['name']).to eq('New Beer')
      end
    end

    context 'when the request is invalid' do
      before { post api_v1_beers_path, params: { beer: { name: '' } },
        headers: { 'Authorization' => "Bearer #{@token}" } } # Missing required fields

      it 'returns status code 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'POST /api/v1/beers' do
    let(:brand) { create(:brand) }
    let(:image_path) { Rails.root.join('spec/fixtures/files/test_image.jpg') }
    let(:image_base64) { "data:image/jpeg;base64,#{Base64.strict_encode64(File.read(image_path))}"
}
    let(:valid_attributes) {
      {
        name: 'New Beer',
        beer_type: 'Ale',
        style: 'Stout',
        hop: 'Cascade',
        yeast: 'Ale yeast',
        malts: 'Barley',
        ibu: '50',
        alcohol: '6%',
        blg: '12',
        brand_id: brand.id,
        image_base64: image_base64
      }
    }

    context 'when the request is valid and includes an image' do
      before { post api_v1_beers_path,
        params: { beer: valid_attributes },
        headers: { 'Authorization' => "Bearer #{@token}" } }

      it 'creates a beer with an image' do
        expect(response).to have_http_status(:created)
        expect(Beer.last.image).to be_attached
      end
    end
  end

  describe 'PUT /api/v1/beers/:id' do
    let(:beer) { create(:beer) }
    let(:valid_attributes) { { name: 'Updated Beer' } }

    context 'when the record exists' do
      before { put api_v1_beer_path(beer),
        headers: { 'Authorization' => "Bearer #{@token}" },
        params: { beer: valid_attributes } }

      it 'updates the record' do
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['beer']['name']).to eq('Updated Beer')
      end
    end
  end

  describe 'DELETE /api/v1/beers/:id' do
    let(:beer) { create(:beer) }

    before { delete api_v1_beer_path(beer),
      headers: { 'Authorization' => "Bearer #{@token}" } }

    it 'deletes the beer and returns status code 204' do
      expect(response).to have_http_status(:no_content)
      expect { beer.reload }.to raise_error ActiveRecord::RecordNotFound
    end
  end
end
